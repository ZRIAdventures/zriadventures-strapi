module.exports = ({ env }) => ({
  /**
   * Users & Permissions
   */
  "users-permissions": {
    config: {
      jwtSecret: env("JWT_SECRET"),
    },
  },

  /**
   * Uploads (Cloudinary)
   */
  upload: {
    config: {
      provider: "cloudinary",
      providerOptions: {
        cloud_name: env("CLOUDINARY_NAME"),
        api_key: env("CLOUDINARY_KEY"),
        api_secret: env("CLOUDINARY_SECRET"),
      },
    },
  },

  // /**
  //  * Redis Plugin (Strapi v5)
  //  * @see https://github.com/strapi-community/plugin-redis
  //  */
  // redis: {
  //   settings: {
  //     debug: env.bool("REDIS_DEBUG", false),
  //     enableRedlock: false, // enable only if you really need distributed locks
  //   },
  //   connections: {
  //     default: {
  //       connection: {
  //         url: env("REDIS_URL"),
  //       },
  //     },
  //   },
  // },

  // /**
  //  * REST Cache Plugin (Redis Provider)
  //  * @see https://docs.strapi.io/dev-docs/plugins/rest-cache
  //  */
  // "rest-cache": {
  //   config: {
  //     provider: {
  //       name: "redis",
  //       options: {
  //         connection: "default",
  //         max: 32767,
  //       },
  //     },

  //     strategy: {
  //       debug: env.bool("REST_CACHE_DEBUG", false),

  //       enableEtagSupport: true,
  //       enableXCacheHeaders: true,
  //       enableAdminCTBMiddleware: true,

  //       resetOnStartup: false,
  //       clearRelatedCache: true,

  //       keysPrefix: "strapi-cache",

  //       headers: ["accept", "accept-encoding", "accept-language"],

  //       /**
  //        * Cache READ-heavy collections only
  //        */
  //       contentTypes: [
  //         {
  //           contentType: "api::experience.experience",
  //           maxAge: 60 * 60 * 1000, // 1 hour
  //         },
  //         {
  //           contentType: "api::tour.tour",
  //           maxAge: 60 * 60 * 1000, // 1 hour
  //         },
  //         {
  //           contentType: "api::merchandise.merchandise",
  //           maxAge: 30 * 60 * 1000, // 30 min
  //         },
  //         {
  //           contentType: "api::rental.rental",
  //           maxAge: 30 * 60 * 1000, // 30 min
  //         },
  //         {
  //           contentType: "api::event.event",
  //           maxAge: 15 * 60 * 1000, // 15 min
  //         },

  //         // Reference / mostly-static data
  //         {
  //           contentType: "api::experience-category.experience-category",
  //           maxAge: 24 * 60 * 60 * 1000, // 24h
  //         },
  //         {
  //           contentType: "api::merchandise-category.merchandise-category",
  //           maxAge: 24 * 60 * 60 * 1000,
  //         },
  //         {
  //           contentType: "api::location.location",
  //           maxAge: 2 * 60 * 60 * 1000, // 2h
  //         },
  //         {
  //           contentType: "api::banner.banner",
  //           maxAge: 30 * 60 * 1000,
  //         },
  //         {
  //           contentType: "api::faq.faq",
  //           maxAge: 2 * 60 * 60 * 1000,
  //         },
  //         {
  //           contentType: "api::terms-and-condition.terms-and-condition",
  //           maxAge: 24 * 60 * 60 * 1000,
  //         },
  //         {
  //           contentType: "api::voucher-template.voucher-template",
  //           maxAge: 60 * 60 * 1000,
  //         },

  //         // DO NOT CACHE (transactional/user-specific data):
  //         // - api::order.order (legacy orders)
  //         // - api::v2-order.v2-order (current orders)
  //         // - api::tour-booking.tour-booking (bookings)
  //         // - api::voucher.voucher (user-specific vouchers)
  //         // - api::review.review (frequently updated, needs fresh data)
  //       ],
  //     },
  //   },
  // },
});
