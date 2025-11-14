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
    // Set up default permissions for tours, tour operators, and related entities
    await setDefaultPermissions(strapi);
  },
};

/**
 * Set default permissions for public and authenticated users
 */
async function setDefaultPermissions(strapi) {
  try {
    // Get the public role
    const publicRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    // Get the authenticated role
    const authenticatedRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'authenticated' } });

    if (!publicRole || !authenticatedRole) {
      console.warn('Could not find public or authenticated roles');
      return;
    }

    // Define permissions for public role (read-only access)
    const publicPermissions = [
      // Tour permissions
      { controller: 'tour', action: 'find' },
      { controller: 'tour', action: 'findOne' },

      // Tour Operator permissions
      { controller: 'tour-operator', action: 'find' },
      { controller: 'tour-operator', action: 'findOne' },

      // Location permissions (for tour start/end locations)
      { controller: 'location', action: 'find' },
      { controller: 'location', action: 'findOne' },

      // Review permissions (read-only)
      { controller: 'review', action: 'find' },
      { controller: 'review', action: 'findOne' },

      // Experience permissions (read-only)
      { controller: 'experience', action: 'find' },
      { controller: 'experience', action: 'findOne' },

      // FAQ permissions
      { controller: 'faq', action: 'find' },
      { controller: 'faq', action: 'findOne' },

      // Terms and conditions permissions
      { controller: 'terms-and-condition', action: 'find' },
      { controller: 'terms-and-condition', action: 'findOne' },
    ];

    // Define permissions for authenticated role (includes create for bookings and reviews)
    const authenticatedPermissions = [
      ...publicPermissions,

      // Tour Booking permissions (create only)
      { controller: 'tour-booking', action: 'create' },
      { controller: 'tour-booking', action: 'find' },
      { controller: 'tour-booking', action: 'findOne' },

      // Review permissions (create)
      { controller: 'review', action: 'create' },
    ];

    // Grant permissions to public role
    for (const permission of publicPermissions) {
      await grantPermission(strapi, publicRole, permission);
    }

    // Grant permissions to authenticated role
    for (const permission of authenticatedPermissions) {
      await grantPermission(strapi, authenticatedRole, permission);
    }

    console.log('✅ Default permissions set successfully for tours and related entities');
  } catch (error) {
    console.error('Error setting default permissions:', error);
  }
}

/**
 * Grant a specific permission to a role
 */
async function grantPermission(strapi, role, { controller, action }) {
  try {
    // Find the permission
    const permission = await strapi
      .query('plugin::users-permissions.permission')
      .findOne({
        where: {
          action: `api::${controller}.${controller}.${action}`,
          role: role.id,
        },
      });

    // If permission exists and is not enabled, enable it
    if (permission && !permission.enabled) {
      await strapi.query('plugin::users-permissions.permission').update({
        where: { id: permission.id },
        data: { enabled: true },
      });
    }
  } catch (error) {
    // Permission might not exist yet, which is okay
    console.debug(`Permission not found or already enabled: ${controller}.${action}`);
  }
}
