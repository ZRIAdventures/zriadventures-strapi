/**
 * Voucher Lifecycle Hooks
 *
 * Auto-sets expiry dates based on voucher type:
 * - CASH vouchers: 6 months validity
 * - EXPERIENCE vouchers: 3 months validity
 * - TOUR vouchers: 3 months validity
 *
 * Also validates:
 * - Fixed amount enforcement
 * - Required fields per voucher type
 * - Coupon code uniqueness and immutability
 */

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;

    // === VALIDATION ===

    // Validate type is present
    if (!data.type) {
      throw new Error("Voucher type is required");
    }

    // Validate CASH vouchers
    if (data.type === "CASH") {
      if (!data.cash || !data.cash.amount || !data.cash.currency) {
        throw new Error("CASH vouchers must have cash amount and currency");
      }

      // Validate fixed amounts
      const validLKRAmounts = [
        10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000,
      ];
      const validUSDAmounts = [10, 15, 20, 25, 30, 35, 40, 45];

      if (
        data.cash.currency === "LKR" &&
        !validLKRAmounts.includes(data.cash.amount)
      ) {
        throw new Error(
          `Invalid LKR amount: ${data.cash.amount}. Must be one of: ${validLKRAmounts.join(", ")}`,
        );
      }

      if (
        data.cash.currency === "USD" &&
        !validUSDAmounts.includes(data.cash.amount)
      ) {
        throw new Error(
          `Invalid USD amount: ${data.cash.amount}. Must be one of: ${validUSDAmounts.join(", ")}`,
        );
      }

      // Ensure experience field is not populated for CASH vouchers
      if (data.experience) {
        data.experience = null;
      }
    }

    // Validate EXPERIENCE vouchers
    if (data.type === "EXPERIENCE") {
      if (!data.experience) {
        throw new Error("EXPERIENCE vouchers must have experience data");
      }

      // Ensure cash field is not populated for EXPERIENCE vouchers
      if (data.cash) {
        data.cash = null;
      }
    }

    // Validate PERCENTAGE vouchers (if used)
    if (data.type === "PERCENTAGE") {
      if (
        !data.percentageAmount ||
        data.percentageAmount <= 0 ||
        data.percentageAmount > 100
      ) {
        throw new Error(
          "PERCENTAGE vouchers must have a valid percentage amount (1-100)",
        );
      }
    }

    // Validate couponCode uniqueness
    if (data.couponCode) {
      const existing = await strapi.db.query("api::voucher.voucher").findOne({
        where: { couponCode: data.couponCode },
      });

      if (existing) {
        throw new Error(`Coupon code ${data.couponCode} already exists`);
      }
    }

    // === AUTO-SET DEFAULTS ===

    // Auto-set expiry date based on voucher type if not manually set
    if (!data.expiryDate) {
      const createdAt = new Date();
      let expiryDate;

      switch (data.type) {
        case "CASH":
          // 6 months validity for cash vouchers
          expiryDate = new Date(createdAt);
          expiryDate.setMonth(expiryDate.getMonth() + 6);
          break;

        case "EXPERIENCE":
        case "TOUR":
          // 3 months validity for experience/tour vouchers
          expiryDate = new Date(createdAt);
          expiryDate.setMonth(expiryDate.getMonth() + 3);
          break;

        case "PERCENTAGE":
          // Percentage vouchers (promo codes) - 3 months default
          expiryDate = new Date(createdAt);
          expiryDate.setMonth(expiryDate.getMonth() + 3);
          break;

        default:
          console.warn(
            `[voucher beforeCreate] Unknown voucher type: ${data.type}`,
          );
          // Default to 3 months
          expiryDate = new Date(createdAt);
          expiryDate.setMonth(expiryDate.getMonth() + 3);
      }

      data.expiryDate = expiryDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
      console.log(
        `[voucher beforeCreate] Auto-set expiry date for ${data.type} voucher: ${data.expiryDate}`,
      );
    }

    // Default voucherStatus to UNPAID if not set
    if (!data.voucherStatus) {
      data.voucherStatus = "UNPAID";
    }

    // Ensure reusable defaults to false if not set
    if (data.reusable === undefined || data.reusable === null) {
      data.reusable = false;
    }
  },

  async beforeUpdate(event) {
    const { data, where } = event.params;

    // Prevent changing coupon code after creation (immutability)
    if (data.couponCode) {
      const existing = await strapi.db.query("api::voucher.voucher").findOne({
        where: where,
      });

      if (existing && existing.couponCode !== data.couponCode) {
        throw new Error(
          "Cannot modify coupon code after creation. Coupon codes are immutable.",
        );
      }
    }

    // Validate CASH voucher amounts on update
    if (data.type === "CASH" && data.cash) {
      const validLKRAmounts = [
        10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000,
      ];
      const validUSDAmounts = [10, 15, 20, 25, 30, 35, 40, 45];

      if (
        data.cash.currency === "LKR" &&
        !validLKRAmounts.includes(data.cash.amount)
      ) {
        throw new Error(`Invalid LKR amount: ${data.cash.amount}`);
      }

      if (
        data.cash.currency === "USD" &&
        !validUSDAmounts.includes(data.cash.amount)
      ) {
        throw new Error(`Invalid USD amount: ${data.cash.amount}`);
      }
    }

    // Prevent manual expiry date changes (system-controlled)
    // Allow admin override only if explicitly setting a future date
    if (data.expiryDate) {
      const newExpiry = new Date(data.expiryDate);
      const now = new Date();

      if (newExpiry < now) {
        console.warn(
          `[voucher beforeUpdate] Attempted to set past expiry date: ${data.expiryDate}`,
        );
        // Allow it for admin correction, but log warning
      }
    }
  },

  async afterCreate(event) {
    const { result } = event;

    console.log(
      `[voucher afterCreate] New voucher created: ${result.couponCode} ` +
        `(Type: ${result.type}, Expiry: ${result.expiryDate}, Status: ${result.voucherStatus})`,
    );

    // Future enhancement: Send voucher email to recipient
    // if (result.email && result.voucherStatus === "AVAILABLE") {
    //   // Trigger email notification
    // }
  },
};
