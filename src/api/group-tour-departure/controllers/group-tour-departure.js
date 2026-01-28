'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController(
  'api::group-tour-departure.group-tour-departure',
  ({ strapi }) => ({
    async reserve(ctx) {
      const id = Number(ctx.params.id);
      const pax = Number(ctx.request.body?.pax);

      if (!id || Number.isNaN(id) || !pax || Number.isNaN(pax) || pax <= 0) {
        return ctx.badRequest('Valid id and pax are required');
      }

      try {
        const result = await strapi
          .service('api::group-tour-departure.group-tour-departure')
          .reserve(id, pax);
        ctx.body = result;
      } catch (error) {
        ctx.status = 409;
        ctx.body = { error: error.message || 'Reservation failed' };
      }
    },

    async release(ctx) {
      const id = Number(ctx.params.id);
      const pax = Number(ctx.request.body?.pax);

      if (!id || Number.isNaN(id) || !pax || Number.isNaN(pax) || pax <= 0) {
        return ctx.badRequest('Valid id and pax are required');
      }

      try {
        const result = await strapi
          .service('api::group-tour-departure.group-tour-departure')
          .release(id, pax);
        ctx.body = result;
      } catch (error) {
        ctx.status = 409;
        ctx.body = { error: error.message || 'Release failed' };
      }
    },
  })
);
