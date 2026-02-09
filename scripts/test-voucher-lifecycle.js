/**
 * Test suite for Voucher lifecycle hooks
 * Tests draft/publish flow and couponCode uniqueness validation
 *
 * Run this test with: npm run strapi -- scripts/test-voucher-lifecycle.js
 */

"use strict";

async function testVoucherLifecycle() {
  console.log("\n🧪 Starting Voucher Lifecycle Tests\n");

  const testResults = {
    passed: 0,
    failed: 0,
    tests: [],
  };

  function logTest(testName, passed, message) {
    const status = passed ? "✅ PASS" : "❌ FAIL";
    console.log(`${status}: ${testName}`);
    if (message) console.log(`   ${message}`);
    testResults.tests.push({ testName, passed, message });
    if (passed) testResults.passed++;
    else testResults.failed++;
  }

  try {
    // Test 1: Create a draft voucher with a unique coupon code
    console.log(
      '\n📝 Test 1: Create draft voucher with couponCode "test-draft-xyz"',
    );
    let draftVoucher;
    try {
      draftVoucher = await strapi.documents("api::voucher.voucher").create({
        data: {
          couponCode: "test-draft-xyz",
          type: "CASH",
          cash: { amount: 10000, currency: "LKR" },
          voucherStatus: "AVAILABLE",
          reusable: false,
        },
      });
      logTest(
        "Create draft voucher",
        true,
        `Created draft with documentId: ${draftVoucher.documentId}`,
      );
      console.log(
        `   Draft ID: ${draftVoucher.id}, Published: ${draftVoucher.publishedAt}`,
      );
    } catch (error) {
      logTest("Create draft voucher", false, error.message);
      throw error;
    }

    // Test 2: Publish the draft voucher (should succeed)
    console.log("\n📤 Test 2: Publish the draft voucher");
    try {
      const publishedVoucher = await strapi
        .documents("api::voucher.voucher")
        .publish({
          documentId: draftVoucher.documentId,
        });
      logTest(
        "Publish draft voucher",
        true,
        'Successfully published without "coupon code exists" error',
      );
      console.log(
        `   Published ID: ${publishedVoucher.id}, Published: ${publishedVoucher.publishedAt}`,
      );
    } catch (error) {
      logTest("Publish draft voucher", false, error.message);
      console.error("   This is the bug we are fixing!");
      throw error;
    }

    // Test 3: Verify draft and published versions coexist
    console.log("\n🔍 Test 3: Verify draft and published versions both exist");
    try {
      const allVersions = await strapi.db
        .query("api::voucher.voucher")
        .findMany({
          where: { couponCode: "test-draft-xyz" },
        });

      const hasDraft = allVersions.some((v) => v.publishedAt === null);
      const hasPublished = allVersions.some((v) => v.publishedAt !== null);
      const sameDocumentId = allVersions.every(
        (v) => v.documentId === draftVoucher.documentId,
      );

      if (
        allVersions.length === 2 &&
        hasDraft &&
        hasPublished &&
        sameDocumentId
      ) {
        logTest(
          "Draft and published coexist",
          true,
          `Found ${allVersions.length} versions with same documentId`,
        );
      } else {
        logTest(
          "Draft and published coexist",
          false,
          `Expected 2 versions, found ${allVersions.length}`,
        );
      }
    } catch (error) {
      logTest("Draft and published coexist", false, error.message);
    }

    // Test 4: Try to create another draft with the same couponCode (should fail)
    console.log(
      "\n🚫 Test 4: Create another voucher with duplicate couponCode (should fail)",
    );
    try {
      await strapi.documents("api::voucher.voucher").create({
        data: {
          couponCode: "test-draft-xyz",
          type: "CASH",
          cash: { amount: 15000, currency: "LKR" },
          voucherStatus: "AVAILABLE",
          reusable: false,
        },
      });
      logTest(
        "Duplicate couponCode validation",
        false,
        'Should have thrown "coupon code exists" error',
      );
    } catch (error) {
      if (
        error.message.includes("already exists") ||
        error.message.includes("coupon code")
      ) {
        logTest(
          "Duplicate couponCode validation",
          true,
          "Correctly rejected duplicate couponCode",
        );
      } else {
        logTest(
          "Duplicate couponCode validation",
          false,
          `Unexpected error: ${error.message}`,
        );
      }
    }

    // Test 5: Create a new draft with different couponCode and publish
    console.log(
      "\n📝 Test 5: Create and publish new voucher with different couponCode",
    );
    try {
      const newDraft = await strapi.documents("api::voucher.voucher").create({
        data: {
          couponCode: "test-different-abc",
          type: "PERCENTAGE",
          percentageAmount: 10,
          voucherStatus: "AVAILABLE",
          reusable: false,
        },
      });

      const newPublished = await strapi
        .documents("api::voucher.voucher")
        .publish({
          documentId: newDraft.documentId,
        });

      logTest(
        "Create and publish new voucher",
        true,
        "New voucher created and published successfully",
      );
    } catch (error) {
      logTest("Create and publish new voucher", false, error.message);
    }

    // Test 6: Test couponCode immutability (should not allow changing couponCode)
    console.log("\n🔒 Test 6: Test couponCode immutability");
    try {
      await strapi.documents("api::voucher.voucher").update({
        documentId: draftVoucher.documentId,
        data: {
          couponCode: "changed-code",
        },
      });
      logTest(
        "CouponCode immutability",
        false,
        "Should have prevented couponCode change",
      );
    } catch (error) {
      if (
        error.message.includes("immutable") ||
        error.message.includes("Cannot modify")
      ) {
        logTest(
          "CouponCode immutability",
          true,
          "Correctly prevented couponCode modification",
        );
      } else {
        logTest(
          "CouponCode immutability",
          false,
          `Unexpected error: ${error.message}`,
        );
      }
    }

    // Cleanup
    console.log("\n🧹 Cleaning up test data...");
    try {
      // Delete test vouchers
      const testVouchers = await strapi.db
        .query("api::voucher.voucher")
        .findMany({
          where: {
            couponCode: {
              $in: ["test-draft-xyz", "test-different-abc"],
            },
          },
        });

      for (const voucher of testVouchers) {
        await strapi.db.query("api::voucher.voucher").delete({
          where: { id: voucher.id },
        });
      }
      console.log(`   Deleted ${testVouchers.length} test voucher(s)`);
    } catch (error) {
      console.error("   Cleanup error:", error.message);
    }
  } catch (error) {
    console.error("\n❌ Test suite failed with error:", error.message);
    console.error(error.stack);
  }

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total Tests: ${testResults.passed + testResults.failed}`);
  console.log(`Passed: ${testResults.passed} ✅`);
  console.log(`Failed: ${testResults.failed} ❌`);
  console.log("=".repeat(60) + "\n");

  if (testResults.failed === 0) {
    console.log(
      "🎉 All tests passed! The voucher lifecycle fix is working correctly.\n",
    );
  } else {
    console.log("⚠️  Some tests failed. Please review the errors above.\n");
  }
}

// Bootstrap Strapi and run tests
async function main() {
  try {
    console.log("🚀 Starting Strapi...");
    await strapi.load();
    console.log("✅ Strapi loaded successfully\n");

    await testVoucherLifecycle();

    console.log("✅ Test execution completed");
    process.exit(0);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { testVoucherLifecycle };
