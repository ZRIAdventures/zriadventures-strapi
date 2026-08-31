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

const { errors } = require("@strapi/utils");
const { ValidationError } = errors;

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;

    // TEMP DIAGNOSTIC - remove once the partial-update-on-published-entity
    // issue is confirmed fixed. Logs exactly what this beforeCreate call
    // received, since the backfill logic below isn't preventing the "CASH
    // vouchers must have cash amount and currency" error in production even
    // when the caller's payload includes full cash data.
    console.log(
      "[voucher beforeCreate][DEBUG] event.params keys:",
      Object.keys(event.params),
    );
    console.log(
      "[voucher beforeCreate][DEBUG] data:",
      JSON.stringify(data),
    );

    // Strapi v5's draft/publish sync can invoke beforeCreate not only for a
    // genuinely new entry, but also when it re-creates the published row for
    // an EXISTING document (e.g. any partial update - flipping voucherStatus,
    // setting confirmationSentAt - routed through the published-entity path).
    // In that sync path `data` only reliably carries the fields the caller
    // actually sent; component fields like `cash` are not carried over, even
    // when explicitly included in the update payload. Validating that
    // incomplete `data` as if it were a fresh create wrongly rejects updates
    // that never touched type/cash/experience at all. Detect this via
    // data.documentId (present only for an existing document) and backfill
    // the missing required fields from the existing row before validating.
    let cashWasBackfilled = false;

    if (
      data.documentId &&
      (!data.type ||
        (data.type === "CASH" && !data.cash) ||
        (data.type === "EXPERIENCE" && !data.experience))
    ) {
      const existing = await strapi.db.query("api::voucher.voucher").findOne({
        where: { documentId: data.documentId },
        populate: ["cash"],
      });

      if (existing) {
        if (!data.type) {
          data.type = existing.type;
        }
        if (data.type === "CASH" && !data.cash && existing.cash) {
          data.cash = {
            amount: existing.cash.amount,
            currency: existing.cash.currency,
          };
          cashWasBackfilled = true;
        }
        if (data.type === "EXPERIENCE" && !data.experience && existing.experience) {
          data.experience = existing.experience;
        }
        if (data.percentageAmount === undefined && existing.percentageAmount != null) {
          data.percentageAmount = existing.percentageAmount;
        }
      }
    }

    // === VALIDATION ===

    // Validate type is present
    if (!data.type) {
      throw new ValidationError("Voucher type is required");
    }

    // Validate CASH vouchers
    if (data.type === "CASH") {
      if (!data.cash || !data.cash.amount || !data.cash.currency) {
        // TEMP DIAGNOSTIC - see note above beforeCreate's opening console.log.
        throw new ValidationError(
          `CASH vouchers must have cash amount and currency ` +
            `[DEBUG documentId=${data.documentId} cashWasBackfilled=${cashWasBackfilled} ` +
            `dataCash=${JSON.stringify(data.cash)} dataKeys=${JSON.stringify(Object.keys(data))}]`,
        );
      }

      // Validate fixed amounts. Skip this for cash data we backfilled from
      // an existing record above: it's already-persisted historical data
      // being carried forward untouched (e.g. a record predating the
      // current fixed-tier list), not new input a caller is submitting.
      const validLKRAmounts = [
        10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000,
      ];
      const validUSDAmounts = [10, 15, 20, 25, 30, 35, 40, 45];

      if (
        !cashWasBackfilled &&
        data.cash.currency === "LKR" &&
        !validLKRAmounts.includes(data.cash.amount)
      ) {
        throw new ValidationError(
          `Invalid LKR amount: ${data.cash.amount}. Must be one of: ${validLKRAmounts.join(", ")}`,
        );
      }

      if (
        !cashWasBackfilled &&
        data.cash.currency === "USD" &&
        !validUSDAmounts.includes(data.cash.amount)
      ) {
        throw new ValidationError(
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
        throw new ValidationError(
          "EXPERIENCE vouchers must have experience data",
        );
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
        throw new ValidationError(
          "PERCENTAGE vouchers must have a valid percentage amount (1-100)",
        );
      }
    }

    // Validate couponCode uniqueness
    // In Strapi v5 with draftAndPublish, draft and published versions share the same documentId
    // but are separate rows. We need to allow the same couponCode within the same document.
    if (data.couponCode) {
      const whereClause = { couponCode: data.couponCode };

      // If this is a publish operation (has documentId), exclude entries with same documentId
      // This allows draft + published versions to coexist with the same couponCode
      if (data.documentId) {
        whereClause.documentId = { $ne: data.documentId };
      }

      const existing = await strapi.db.query("api::voucher.voucher").findOne({
        where: whereClause,
      });

      if (existing) {
        throw new ValidationError(
          `Coupon code ${data.couponCode} already exists`,
        );
      }
    }

    // === AUTO-SET DEFAULTS ===

    // Reject a manually-supplied expiry date that's already in the past.
    // Only applies to a genuinely new voucher (no documentId) - the
    // documentId-bearing publish-sync path above can legitimately carry an
    // expiryDate from long ago (e.g. re-syncing an old voucher whose
    // validity window has since elapsed), which must not be rejected here.
    if (!data.documentId && data.expiryDate) {
      const today = new Date().toISOString().split("T")[0];
      if (data.expiryDate < today) {
        throw new ValidationError(
          `Expiry date ${data.expiryDate} is in the past. Vouchers must expire in the future.`,
        );
      }
    }

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
      // In Strapi v5, use documentId or id to properly identify the entry
      const id = where?.documentId || where?.id;

      if (!id) {
        console.warn(
          "[voucher beforeUpdate] No id or documentId found in where clause",
        );
        return;
      }

      const existing = await strapi.db.query("api::voucher.voucher").findOne({
        where: {
          $or: [{ documentId: id }, { id: id }],
        },
      });

      if (existing && existing.couponCode !== data.couponCode) {
        throw new ValidationError(
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
        throw new ValidationError(`Invalid LKR amount: ${data.cash.amount}`);
      }

      if (
        data.cash.currency === "USD" &&
        !validUSDAmounts.includes(data.cash.amount)
      ) {
        throw new ValidationError(`Invalid USD amount: ${data.cash.amount}`);
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

    // The recipient email is sent from the Next.js app (ensureVouchers() in
    // lib/server/orders/process-success.ts) right after it creates the
    // voucher via the REST API, not from this hook. Sending it here too
    // would double-send, since the create call above IS that request.
  },
};
