"use strict";

/**
 * Partial voucher redemption tests.
 *
 * Verifies the behaviour the gift voucher terms promise ("the voucher can be
 * used as a full or part payment"): spending less than a CASH voucher's
 * balance must leave the rest on it, and only a fully-drawn voucher becomes
 * CLAIMED.
 *
 * Usage:
 *   npm run strapi -- scripts/test-voucher-redemption.js
 */

const results = [];

function record(name, passed, detail) {
  results.push({ name, passed, detail });
  console.log(`${passed ? "✅ PASS" : "❌ FAIL"}: ${name}${detail ? ` - ${detail}` : ""}`);
}

async function createCashVoucher(strapi, couponCode, amount, currency = "LKR") {
  return strapi.documents("api::voucher.voucher").create({
    data: {
      couponCode,
      type: "CASH",
      cash: { amount, currency },
      voucherStatus: "AVAILABLE",
      reusable: false,
    },
  });
}

async function readVoucher(strapi, documentId) {
  return strapi.db.query("api::voucher.voucher").findOne({
    where: { documentId },
    populate: ["cash"],
  });
}

async function testVoucherRedemption() {
  console.log("\n🧪 Starting Voucher Redemption Tests\n");

  const service = strapi.service("api::voucher.voucher");
  const suffix = Date.now().toString().slice(-8);
  const created = [];

  try {
    // ---------------------------------------------------------------- 1
    const partial = await createCashVoucher(
      strapi,
      `TEST-PARTIAL-${suffix}`,
      25000,
    );
    created.push(partial.documentId);

    await service.redeem(partial.documentId, 5000);
    let row = await readVoucher(strapi, partial.documentId);

    record(
      "Partial redemption keeps the voucher AVAILABLE",
      row.voucherStatus === "AVAILABLE",
      `status=${row.voucherStatus}`,
    );
    record(
      "Partial redemption records the spent amount",
      Number(row.redeemedAmount) === 5000,
      `redeemedAmount=${row.redeemedAmount}`,
    );

    // ---------------------------------------------------------------- 2
    await service.redeem(partial.documentId, 20000);
    row = await readVoucher(strapi, partial.documentId);
    record(
      "Spending the last of the balance marks it CLAIMED",
      row.voucherStatus === "CLAIMED" && Number(row.redeemedAmount) === 25000,
      `status=${row.voucherStatus}, redeemedAmount=${row.redeemedAmount}`,
    );

    // ---------------------------------------------------------------- 3
    let overspendRejected = false;
    try {
      await service.redeem(partial.documentId, 1);
    } catch {
      overspendRejected = true;
    }
    record(
      "A spent-out voucher cannot be redeemed again",
      overspendRejected,
    );

    // ---------------------------------------------------------------- 4
    await service.refund(partial.documentId, 20000);
    row = await readVoucher(strapi, partial.documentId);
    record(
      "Refund restores balance and re-opens the voucher",
      row.voucherStatus === "AVAILABLE" && Number(row.redeemedAmount) === 5000,
      `status=${row.voucherStatus}, redeemedAmount=${row.redeemedAmount}`,
    );

    // ---------------------------------------------------------------- 5
    const overspend = await createCashVoucher(
      strapi,
      `TEST-OVERSPEND-${suffix}`,
      10000,
    );
    created.push(overspend.documentId);

    let tooMuchRejected = false;
    try {
      await service.redeem(overspend.documentId, 10001);
    } catch {
      tooMuchRejected = true;
    }
    row = await readVoucher(strapi, overspend.documentId);
    record(
      "Redeeming more than the balance is rejected and changes nothing",
      tooMuchRejected && Number(row.redeemedAmount ?? 0) === 0,
      `redeemedAmount=${row.redeemedAmount}`,
    );

    // ---------------------------------------------------------------- 6
    // Two orders racing for the last of a balance: exactly one may win.
    const race = await createCashVoucher(strapi, `TEST-RACE-${suffix}`, 10000);
    created.push(race.documentId);

    const outcomes = await Promise.allSettled([
      service.redeem(race.documentId, 10000),
      service.redeem(race.documentId, 10000),
    ]);
    const winners = outcomes.filter((o) => o.status === "fulfilled").length;
    row = await readVoucher(strapi, race.documentId);
    record(
      "Concurrent redemptions can't both spend the same balance",
      winners === 1 && Number(row.redeemedAmount) === 10000,
      `winners=${winners}, redeemedAmount=${row.redeemedAmount}`,
    );
  } finally {
    for (const documentId of created) {
      try {
        await strapi.documents("api::voucher.voucher").delete({ documentId });
      } catch (error) {
        console.warn(`Cleanup failed for ${documentId}: ${error.message}`);
      }
    }
  }

  const passed = results.filter((r) => r.passed).length;
  console.log(`\n📊 ${passed}/${results.length} passed`);

  if (passed !== results.length) {
    process.exitCode = 1;
  }
}

async function main() {
  try {
    console.log("🚀 Starting Strapi...");
    await strapi.load();
    console.log("✅ Strapi loaded successfully\n");

    await testVoucherRedemption();

    console.log("✅ Test execution completed");
    process.exit(process.exitCode ?? 0);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testVoucherRedemption };
