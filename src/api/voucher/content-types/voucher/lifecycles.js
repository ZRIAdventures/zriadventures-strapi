/**
 * Voucher Lifecycle Hooks
 *
 * Auto-sets expiry dates based on voucher type:
 * - CASH vouchers: 6 months validity
 * - EXPERIENCE vouchers: 3 months validity
 * - TOUR vouchers: 3 months validity
 */

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;

    // Auto-set expiry date based on voucher type if not manually set
    if (!data.expiryDate && data.type) {
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
          console.warn(`[voucher beforeCreate] Unknown voucher type: ${data.type}`);
          // Default to 3 months
          expiryDate = new Date(createdAt);
          expiryDate.setMonth(expiryDate.getMonth() + 3);
      }

      data.expiryDate = expiryDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      console.log(
        `[voucher beforeCreate] Auto-set expiry date for ${data.type} voucher: ${data.expiryDate}`
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
    const { data } = event.params;

    // Prevent manual expiry date changes (system-controlled)
    // Allow admin override only if explicitly setting a future date
    if (data.expiryDate) {
      const newExpiry = new Date(data.expiryDate);
      const now = new Date();

      if (newExpiry < now) {
        console.warn(
          `[voucher beforeUpdate] Attempted to set past expiry date: ${data.expiryDate}`
        );
        // Allow it for admin correction, but log warning
      }
    }
  },

  async afterCreate(event) {
    const { result } = event;

    console.log(
      `[voucher afterCreate] New voucher created: ${result.couponCode} ` +
      `(Type: ${result.type}, Expiry: ${result.expiryDate}, Status: ${result.voucherStatus})`
    );

    // Future enhancement: Send voucher email to recipient
    // if (result.email && result.voucherStatus === "AVAILABLE") {
    //   // Trigger email notification
    // }
  },
};
