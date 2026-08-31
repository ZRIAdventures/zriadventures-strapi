'use strict';

/**
 * Custom router (not createCoreRouter) so /reserve and /release can sit
 * alongside the standard CRUD actions.
 *
 * No `config.auth` is set on any route here: Strapi auto-generates a
 * per-action scope (`api::group-tour-departure.group-tour-departure.<action>`)
 * for any route left unconfigured, which is what makes each action gated by
 * its own permission toggle in Settings > Roles. Do NOT set
 * `auth: { scope: [] }` here — an empty scope array short-circuits the
 * users-permissions policy's `Array.prototype.every` check to always true,
 * which makes the route effectively public regardless of role permissions.
 */
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/group-tour-departures',
      handler: 'group-tour-departure.find',
    },
    {
      method: 'GET',
      path: '/group-tour-departures/:id',
      handler: 'group-tour-departure.findOne',
    },
    {
      method: 'POST',
      path: '/group-tour-departures',
      handler: 'group-tour-departure.create',
    },
    {
      method: 'PUT',
      path: '/group-tour-departures/:id',
      handler: 'group-tour-departure.update',
    },
    {
      method: 'DELETE',
      path: '/group-tour-departures/:id',
      handler: 'group-tour-departure.delete',
    },
    {
      method: 'POST',
      path: '/group-tour-departures/:id/reserve',
      handler: 'group-tour-departure.reserve',
    },
    {
      method: 'POST',
      path: '/group-tour-departures/:id/release',
      handler: 'group-tour-departure.release',
    },
  ],
};
