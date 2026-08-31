'use strict';

/**
 * voucher service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService(
  'api::voucher.voucher',
  ({ strapi }) => ({
    // Atomically transitions AVAILABLE -> CLAIMED for the published voucher
    // row via a single conditional UPDATE ... WHERE ... RETURNING, so two
    // concurrent requests racing to claim the same non-reusable coupon can
    // never both succeed (unlike a read-then-write PUT from the REST API).
    async claim(documentId) {
      const knex = strapi.db.connection;

      const result = await knex.raw(
        `
          UPDATE vouchers
          SET voucher_status = 'CLAIMED'
          WHERE document_id = ?
            AND published_at IS NOT NULL
            AND voucher_status = 'AVAILABLE'
          RETURNING id, document_id, voucher_status
        `,
        [documentId]
      );

      const row = result?.rows?.[0] ?? result?.[0]?.[0];

      if (!row) {
        throw new Error(
          'Voucher is not available to claim (already claimed, not found, or unpublished)'
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
          SET voucher_status = 'AVAILABLE'
          WHERE document_id = ?
            AND published_at IS NOT NULL
            AND voucher_status = 'CLAIMED'
          RETURNING id, document_id, voucher_status
        `,
        [documentId]
      );

      const row = result?.rows?.[0] ?? result?.[0]?.[0];

      if (!row) {
        throw new Error('Voucher was not in a claimed state to release');
      }

      return row;
    },
  })
);
