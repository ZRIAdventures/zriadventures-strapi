'use strict';

/**
 * voucher controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

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
  })
);
