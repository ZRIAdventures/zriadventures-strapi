'use strict';

/**
 * voucher service
 */

const { createCoreService } = require('@strapi/strapi').factories;

// Money comparisons run against a Postgres `numeric` column, so give every
// >= / <= guard a cent of slack rather than trusting exact decimal equality.
const EPSILON = 0.005;

const round2 = (value) => Math.round(Number(value) * 100) / 100;

const firstRow = (result) => result?.rows?.[0] ?? result?.[0]?.[0];

module.exports = createCoreService(
  'api::voucher.voucher',
  ({ strapi }) => ({
    // Atomically transitions AVAILABLE -> CLAIMED via a single conditional
    // UPDATE ... WHERE ... RETURNING, so two concurrent requests racing to
    // claim the same non-reusable coupon can never both succeed (unlike a
    // read-then-write PUT from the REST API).
    //
    // This is the all-or-nothing path, used for PERCENTAGE promo codes and
    // EXPERIENCE vouchers, which carry no drawable balance. CASH vouchers go
    // through redeem() instead so an unspent balance survives the order.
    //
    // NOTE: no `published_at IS NOT NULL` filter here. The voucher content
    // type has draftAndPublish disabled, so there is exactly one row per
    // document and Strapi stamps publishedAt on create regardless - matching
    // group-tour-departure's reserve/release, which never filtered on it.
    async claim(documentId) {
      const knex = strapi.db.connection;

      const result = await knex.raw(
        `
          UPDATE vouchers
          SET voucher_status = 'CLAIMED'
          WHERE document_id = ?
            AND voucher_status = 'AVAILABLE'
          RETURNING id, document_id, voucher_status, redeemed_amount
        `,
        [documentId]
      );

      const row = firstRow(result);

      if (!row) {
        throw new Error(
          'Voucher is not available to claim (already claimed, expired, or not found)'
        );
      }

      return row;
    },

    // Reverses a claim (payment failed, order abandoned, or an admin/cron
    // needs to give the coupon back). Only releases a voucher that is
    // actually CLAIMED, so it can't accidentally resurrect an EXPIRED one.
    async release(documentId) {
      const knex = strapi.db.connection;

      const result = await knex.raw(
        `
          UPDATE vouchers
          SET voucher_status = 'AVAILABLE',
              redeemed_amount = 0
          WHERE document_id = ?
            AND voucher_status = 'CLAIMED'
          RETURNING id, document_id, voucher_status, redeemed_amount
        `,
        [documentId]
      );

      const row = firstRow(result);

      if (!row) {
        throw new Error('Voucher was not in a claimed state to release');
      }

      return row;
    },

    // Draws `amount` off a CASH voucher's remaining balance.
    //
    // The gift voucher terms promise the voucher "can be used as a full or
    // part payment", so spending less than the face value must leave the
    // rest on the voucher instead of burning the whole thing - the old
    // claim()-only flow silently forfeited the difference.
    //
    // The face value is read first (it lives in a component table, so it
    // can't be joined into the conditional UPDATE cheaply), but the balance
    // arithmetic itself happens inside one conditional UPDATE: two orders
    // racing on the same voucher can never redeem more than it holds,
    // because the `remaining >= amount` guard is evaluated by the database
    // against the row it is about to write.
    async redeem(documentId, requestedAmount) {
      const voucher = await strapi.db.query('api::voucher.voucher').findOne({
        where: { documentId },
        populate: ['cash'],
      });

      if (!voucher) {
        throw new Error('Voucher not found');
      }

      // PERCENTAGE promo codes and EXPERIENCE vouchers have no balance to
      // draw down - they behave exactly as before.
      if (voucher.type !== 'CASH') {
        return this.claim(documentId);
      }

      const faceValue = Number(voucher.cash?.amount);
      if (!Number.isFinite(faceValue) || faceValue <= 0) {
        throw new Error('Voucher is missing its cash value');
      }

      const amount = round2(requestedAmount);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('Redemption amount must be greater than zero');
      }

      const knex = strapi.db.connection;

      const result = await knex.raw(
        `
          UPDATE vouchers
          SET redeemed_amount = COALESCE(redeemed_amount, 0) + ?,
              voucher_status = CASE
                WHEN COALESCE(redeemed_amount, 0) + ? >= ? - ? THEN 'CLAIMED'
                ELSE voucher_status
              END
          WHERE document_id = ?
            AND voucher_status = 'AVAILABLE'
            AND COALESCE(redeemed_amount, 0) + ? <= ? + ?
          RETURNING id, document_id, voucher_status, redeemed_amount
        `,
        [
          amount,
          amount,
          faceValue,
          EPSILON,
          documentId,
          amount,
          faceValue,
          EPSILON,
        ]
      );

      const row = firstRow(result);

      if (!row) {
        throw new Error(
          'Voucher does not have enough remaining balance to redeem (or is no longer available)'
        );
      }

      return {
        ...row,
        faceValue,
        redeemedNow: amount,
        remainingAmount: round2(
          Math.max(0, faceValue - Number(row.redeemed_amount ?? 0))
        ),
      };
    },

    // Puts `amount` back onto a CASH voucher after a redeem() that didn't
    // stick (payment failed, order abandoned, admin reversal). A voucher
    // that redeem() had drawn all the way down to CLAIMED becomes AVAILABLE
    // again; one that still had balance left was never CLAIMED, so only its
    // balance moves. EXPIRED vouchers are deliberately not resurrected.
    async refund(documentId, requestedAmount) {
      const amount = round2(requestedAmount);

      if (!Number.isFinite(amount) || amount <= 0) {
        // Nothing to give back per-amount (PERCENTAGE/EXPERIENCE coupon, or
        // a legacy order with no recorded discount) - fall back to the
        // all-or-nothing reversal.
        return this.release(documentId);
      }

      const knex = strapi.db.connection;

      const result = await knex.raw(
        `
          UPDATE vouchers
          SET redeemed_amount = GREATEST(COALESCE(redeemed_amount, 0) - ?, 0),
              voucher_status = CASE
                WHEN voucher_status = 'CLAIMED' THEN 'AVAILABLE'
                ELSE voucher_status
              END
          WHERE document_id = ?
            AND voucher_status IN ('AVAILABLE', 'CLAIMED')
          RETURNING id, document_id, voucher_status, redeemed_amount
        `,
        [amount, documentId]
      );

      const row = firstRow(result);

      if (!row) {
        throw new Error('Voucher was not in a refundable state');
      }

      return row;
    },
  })
);
