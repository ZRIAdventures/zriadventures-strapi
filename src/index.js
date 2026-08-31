'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap: async ({ strapi }) => {
    await setDefaultPermissions(strapi);
  },
};

/**
 * Set default permissions for public and authenticated users.
 *
 * Only covers content that is meant to be reachable from the public
 * marketing site / checkout flow. `order`, `v2-order`, and `voucher` (beyond
 * its claim/release actions) are deliberately left out - they carry
 * customer PII and payment data and should stay admin/API-token managed.
 */
async function setDefaultPermissions(strapi) {
  try {
    const publicRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    const authenticatedRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'authenticated' } });

    if (!publicRole || !authenticatedRole) {
      strapi.log.warn('Could not find public or authenticated roles');
      return;
    }

    // Read-only catalog/content, safe for anonymous access.
    const publicReadOnly = [
      'banner',
      'event',
      'experience',
      'experience-category',
      'faq',
      'location',
      'merchandise',
      'merchandise-category',
      'rental',
      'review',
      'terms-and-condition',
      'tour',
      'voucher-template',
    ].flatMap((controller) => [
      { controller, action: 'find' },
      { controller, action: 'findOne' },
    ]);

    const publicPermissions = [
      ...publicReadOnly,

      // Group tour departures: browsing + the capacity actions used by the
      // unauthenticated checkout flow. create/update/delete are
      // intentionally NOT granted here - those stay admin-only.
      { controller: 'group-tour-departure', action: 'find' },
      { controller: 'group-tour-departure', action: 'findOne' },
      { controller: 'group-tour-departure', action: 'reserve' },
      { controller: 'group-tour-departure', action: 'release' },

      // Voucher claim/release, used by the checkout flow. Vouchers
      // themselves are never publicly listable/findable.
      { controller: 'voucher', action: 'claim' },
      { controller: 'voucher', action: 'release' },
    ];

    const authenticatedPermissions = [
      ...publicPermissions,

      // Tour bookings: logged-in customers only.
      { controller: 'tour-booking', action: 'create' },
      { controller: 'tour-booking', action: 'find' },
      { controller: 'tour-booking', action: 'findOne' },

      // Reviews: logged-in customers can submit.
      { controller: 'review', action: 'create' },
    ];

    for (const permission of publicPermissions) {
      await grantPermission(strapi, publicRole, permission);
    }

    for (const permission of authenticatedPermissions) {
      await grantPermission(strapi, authenticatedRole, permission);
    }

    strapi.log.info('Default permissions set successfully for public/authenticated roles');
  } catch (error) {
    strapi.log.error('Error setting default permissions:', error);
  }
}

/**
 * Grant a specific permission to a role
 */
async function grantPermission(strapi, role, { controller, action }) {
  try {
    const permission = await strapi
      .query('plugin::users-permissions.permission')
      .findOne({
        where: {
          action: `api::${controller}.${controller}.${action}`,
          role: role.id,
        },
      });

    if (permission && !permission.enabled) {
      await strapi.query('plugin::users-permissions.permission').update({
        where: { id: permission.id },
        data: { enabled: true },
      });
    }
  } catch (error) {
    strapi.log.debug(`Permission not found or already enabled: ${controller}.${action}`);
  }
}
