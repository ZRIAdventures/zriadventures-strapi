'use strict';

/**
 * Custom voucher claim/release routes.
 * Kept in a separate file (Strapi merges all files under routes/) so the
 * core CRUD router in voucher.js stays untouched.
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/vouchers/:documentId/claim',
      handler: 'voucher.claim',
      config: { auth: { scope: [] } },
    },
    {
      method: 'POST',
      path: '/vouchers/:documentId/release',
      handler: 'voucher.release',
      config: { auth: { scope: [] } },
    },
  ],
};
