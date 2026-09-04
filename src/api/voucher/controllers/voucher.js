'use strict';

/**
 * voucher controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

function readAmount(ctx) {
  const body = ctx.request?.body ?? {};
  const raw = body.amount ?? body.data?.amount;
  if (raw === undefined || raw === null || raw === '') return null;
  const amount = Number(raw);
  return Number.isFinite(amount) ? amount : NaN;
}

module.exports = createCoreController(
  'api::voucher.voucher',
  ({ strapi }) => ({
    async claim(ctx) {
      const documentId = ctx.params.documentId;

      if (!documentId) {
        return ctx.badRequest('documentId is required');
      }

      try {
        const result = await strapi
          .service('api::voucher.voucher')
          .claim(documentId);
        ctx.body = { data: result };
      } catch (error) {
        ctx.status = 409;
        ctx.body = { error: error.message || 'Claim failed' };
      }
    },

    async release(ctx) {
      const documentId = ctx.params.documentId;

      if (!documentId) {
        return ctx.badRequest('documentId is required');
      }

      try {
        const result = await strapi
          .service('api::voucher.voucher')
          .release(documentId);
        ctx.body = { data: result };
      } catch (error) {
        ctx.status = 409;
        ctx.body = { error: error.message || 'Release failed' };
      }
    },

    // Partial redemption: draws `amount` off a CASH voucher's balance and
    // only marks it CLAIMED once nothing is left. See the service for why
    // this exists alongside claim().
    async redeem(ctx) {
      const documentId = ctx.params.documentId;

      if (!documentId) {
        return ctx.badRequest('documentId is required');
      }

      const amount = readAmount(ctx);
      if (amount !== null && (Number.isNaN(amount) || amount <= 0)) {
        return ctx.badRequest('amount must be a positive number');
      }

      try {
        const service = strapi.service('api::voucher.voucher');
        const result =
          amount === null
            ? await service.claim(documentId)
            : await service.redeem(documentId, amount);
        ctx.body = { data: result };
      } catch (error) {
        ctx.status = 409;
        ctx.body = { error: error.message || 'Redeem failed' };
      }
    },

    // Reverses a redeem(). Falls back to a full release when no amount is
    // supplied, so legacy orders (recorded before balances existed) still
    // get their coupon back.
    async refund(ctx) {
      const documentId = ctx.params.documentId;

      if (!documentId) {
        return ctx.badRequest('documentId is required');
      }

      const amount = readAmount(ctx);
      if (amount !== null && (Number.isNaN(amount) || amount <= 0)) {
        return ctx.badRequest('amount must be a positive number');
      }

      try {
        const result = await strapi
          .service('api::voucher.voucher')
          .refund(documentId, amount ?? 0);
        ctx.body = { data: result };
      } catch (error) {
        ctx.status = 409;
        ctx.body = { error: error.message || 'Refund failed' };
      }
    },
  })
);
