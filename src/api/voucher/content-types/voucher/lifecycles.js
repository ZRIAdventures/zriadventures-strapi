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

// Cash vouchers accept any amount at or above the minimum, in whole
// increments of the currency's step - not just the predefined tiers shown in
// the UI. Keep this in sync with zriadventures-web's lib/booking/voucherCash.ts.
const CASH_RULES = {
  LKR: { min: 1000, increment: 1000 },
  USD: { min: 5, increment: 5 },
};

function isValidCashAmount(currency, amount) {
  const rule = CASH_RULES[currency];
  if (!rule || typeof amount !== "number" || !Number.isFinite(amount)) {
    return false;
  }
  return amount >= rule.min && amount % rule.increment === 0;
}

// Once Strapi's document service has processed a component field for
// create/update, the value handed to this lifecycle is no longer the raw
// {amount, currency} payload a caller submitted - it's an internal pivot
// reference like `{id: 74, __pivot: {field: 'cash', component_type: '...'}}`
// pointing at a component row Strapi already created/attached elsewhere in
// the same request. Never re-validate or overwrite a value in that shape:
// doing so previously caused the linked component to go missing entirely
// (the pivot reference would get replaced by a plain object attachRelations
// doesn't know how to attach), which is how CASH vouchers ended up with no
// `cash` data despite having been created successfully. Only ever treat a
// plain object (no `__pivot`) as real, validatable input.
function isComponentPivotRef(value) {
  return Boolean(value && typeof value === "object" && value.__pivot);
}

function hasCashData(cash) {
  return Boolean(cash && cash.amount != null && cash.currency != null);
}

// Verifies the cash component actually landed on a just-created CASH
// voucher row and repairs it if the draft/publish sync dropped it (see the
// isComponentPivotRef comment above for why beforeCreate can't always catch
// this itself - the pivot attach can still silently fail after validation
// is skipped). Runs decoupled from the create's own transaction via
// setImmediate: an earlier same-transaction repair attempt here caused lock
// contention with create()'s transaction on the same row and hung requests.
async function repairCashIfMissing(created) {
  if (created.type !== "CASH") return;

  try {
    const fresh = await strapi.db.query("api::voucher.voucher").findOne({
      where: { id: created.id },
      populate: ["cash"],
    });
    if (!fresh || hasCashData(fresh.cash)) return;

    // Recover from whichever copy of this document actually has good data -
    // the value on the row we just created, or its draft/published
    // counterpart (they're only out of sync because of the drop we're
    // working around).
    const sibling = created.documentId
      ? await strapi.db.query("api::voucher.voucher").findOne({
          where: { documentId: created.documentId, id: { $ne: created.id } },
          populate: ["cash"],
        })
      : null;

    const source = hasCashData(created.cash)
      ? created.cash
      : hasCashData(sibling?.cash)
        ? sibling.cash
        : null;

    if (!source) {
      strapi.log.error(
        `[voucher] CASH voucher ${created.documentId} (row ${created.id}) is ` +
          `missing cash data and no known-good copy was found to recover ` +
          `from - manual fix required.`,
      );
      return;
    }

    strapi.log.warn(
      `[voucher] Repairing cash component dropped by draft/publish sync on ` +
        `voucher ${created.documentId} (row ${created.id}) using recovered ` +
        `value ${JSON.stringify(source)}.`,
    );
    await strapi.db.query("api::voucher.voucher").update({
      where: { id: created.id },
      data: { cash: { amount: source.amount, currency: source.currency } },
    });
  } catch (error) {
    strapi.log.error(
      `[voucher] Failed to verify/repair cash data for voucher ${created.documentId}: ${error.message}`,
    );
  }
}

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;

    // Strapi v5's draft/publish sync can invoke beforeCreate not only for a
    // genuinely new entry, but also when it re-creates the published row for
    // an EXISTING document (e.g. any partial update - flipping voucherStatus,
    // setting confirmationSentAt - routed through the published-entity path,
    // or the admin panel's Publish button). Detect that via an existing row
    // with the same documentId, and backfill plain (non-component-pivot)
    // fields from it whenever the sync payload doesn't carry real values.
    let existing = null;
    if (data.documentId) {
      existing = await strapi.db.query("api::voucher.voucher").findOne({
        where: { documentId: data.documentId },
        populate: ["cash"],
      });
    }

    if (existing) {
      if (!data.type) {
        data.type = existing.type;
      }
      if (data.type === "EXPERIENCE" && !data.experience && existing.experience) {
        data.experience = existing.experience;
      }
      if (data.percentageAmount == null && existing.percentageAmount != null) {
        data.percentageAmount = existing.percentageAmount;
      }
      if (
        data.type === "CASH" &&
        !isComponentPivotRef(data.cash) &&
        !hasCashData(data.cash) &&
        hasCashData(existing.cash)
      ) {
        data.cash = { amount: existing.cash.amount, currency: existing.cash.currency };
      }
      if (!data.expiryDate && existing.expiryDate) {
        // Preserve the originally-computed expiry - never recompute it just
        // because the document is being re-synced/republished.
        data.expiryDate = existing.expiryDate;
      }
    }

    // === VALIDATION ===

    // Validate type is present
    if (!data.type) {
      throw new ValidationError("Voucher type is required");
    }

    // Validate CASH vouchers
    if (data.type === "CASH") {
      if (isComponentPivotRef(data.cash)) {
        // Already-attached component from earlier in this same request -
        // trust it, Strapi's own attribute validation already ran on the
        // original raw input before it reached this pivot shape.
      } else {
        if (!hasCashData(data.cash)) {
          throw new ValidationError(
            "CASH vouchers must have cash amount and currency",
          );
        }

        if (!isValidCashAmount(data.cash.currency, data.cash.amount)) {
          const rule = CASH_RULES[data.cash.currency];
          if (!rule) {
            throw new ValidationError(
              `Unsupported cash voucher currency: ${data.cash.currency}`,
            );
          }
          throw new ValidationError(
            `Invalid ${data.cash.currency} amount: ${data.cash.amount}. Must be at least ` +
              `${rule.min} in increments of ${rule.increment}.`,
          );
        }
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

      const existingCoupon = await strapi.db.query("api::voucher.voucher").findOne({
        where: whereClause,
      });

      if (existingCoupon) {
        throw new ValidationError(
          `Coupon code ${data.couponCode} already exists`,
        );
      }
    }

    // === AUTO-SET DEFAULTS ===

    // Reject a manually-supplied expiry date that's already in the past.
    // Only applies to a genuinely new voucher (no pre-existing row for this
    // document) - the publish-sync path above can legitimately carry an
    // expiryDate from long ago (e.g. re-syncing an old voucher whose
    // validity window has since elapsed), which must not be rejected here.
    if (!existing && data.expiryDate) {
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
          strapi.log.warn(
            `[voucher beforeCreate] Unknown voucher type: ${data.type}`,
          );
          // Default to 3 months
          expiryDate = new Date(createdAt);
          expiryDate.setMonth(expiryDate.getMonth() + 3);
      }

      data.expiryDate = expiryDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
      strapi.log.info(
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
        strapi.log.warn(
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

    // Validate CASH voucher amounts on update. Skip when the value is
    // Strapi's internal component pivot reference rather than real caller
    // input - see the isComponentPivotRef comment in beforeCreate for why
    // re-validating/overwriting that shape is unsafe.
    if (data.type === "CASH" && data.cash && !isComponentPivotRef(data.cash)) {
      if (!isValidCashAmount(data.cash.currency, data.cash.amount)) {
        const rule = CASH_RULES[data.cash.currency];
        throw new ValidationError(
          rule
            ? `Invalid ${data.cash.currency} amount: ${data.cash.amount}. Must be at least ` +
              `${rule.min} in increments of ${rule.increment}.`
            : `Unsupported cash voucher currency: ${data.cash.currency}`,
        );
      }
    }

    // Prevent manual expiry date changes (system-controlled)
    // Allow admin override only if explicitly setting a future date
    if (data.expiryDate) {
      const newExpiry = new Date(data.expiryDate);
      const now = new Date();

      if (newExpiry < now) {
        strapi.log.warn(
          `[voucher beforeUpdate] Attempted to set past expiry date: ${data.expiryDate}`,
        );
        // Allow it for admin correction, but log warning
      }
    }
  },

  async afterCreate(event) {
    const { result } = event;

    strapi.log.info(
      `[voucher afterCreate] New voucher created: ${result.couponCode} ` +
        `(Type: ${result.type}, Expiry: ${result.expiryDate}, Status: ${result.voucherStatus})`,
    );

    // Deliberately not awaited/nested in this handler - see
    // repairCashIfMissing's own comment for why it must run decoupled from
    // this transaction. This covers every path that can (re)create a CASH
    // voucher row (purchases, admin edits, the Publish button, draft/publish
    // sync), not just the checkout flow that zriadventures-web's
    // verifyAndRepairCashVoucher (lib/server/orders/process-success.ts)
    // already guards.
    setImmediate(() => {
      repairCashIfMissing(result);
    });

    // The recipient email is sent from the Next.js app (ensureVouchers() in
    // lib/server/orders/process-success.ts) right after it creates the
    // voucher via the REST API, not from this hook. Sending it here too
    // would double-send, since the create call above IS that request.
  },
};
