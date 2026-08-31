'use strict';

/**
 * Custom voucher claim/release routes.
 * Kept in a separate file (Strapi merges all files under routes/) so the
 * core CRUD router in voucher.js stays untouched.
 *
 * No `config.auth` is set here: Strapi auto-generates a per-action scope
 * (`api::voucher.voucher.claim` / `.release`) for any route left
 * unconfigured, which is what makes each action gated by its own permission
 * toggle in Settings > Roles. Do NOT set `auth: { scope: [] }` here — an
 * empty scope array short-circuits the users-permissions policy's
 * `Array.prototype.every` check to always true, which makes the route
 * effectively public regardless of role permissions.
 */
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/vouchers/:documentId/claim',
      handler: 'voucher.claim',
    },
    {
      method: 'POST',
      path: '/vouchers/:documentId/release',
      handler: 'voucher.release',
    },
  ],
};
