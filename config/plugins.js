module.exports = ({ env }) => ({
  "users-permissions": {
    config: {
      jwtSecret: env("JWT_SECRET"),
    },
  },
  upload: {
    config: {
      provider: "cloudinary",
      providerOptions: {
        cloud_name: env("CLOUDINARY_NAME"),
        api_key: env("CLOUDINARY_KEY"),
        api_secret: env("CLOUDINARY_SECRET"),
      },
      actionOptions: {
        upload: {},
        delete: {},
      },
    },
  },
  "rest-cache": {
    config: {
      provider: {
        name: "redis",
        options: {
          max: 32767,
          connection: "default",
          host: env("REDISHOST", "127.0.0.1"),
          port: env.int("REDISPORT", 6379),
          password: env("REDISPASSWORD", ""),
          username: env("REDISUSER", "default"),
          db: env("REDIS_URL"),
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          retryStrategy(times) {
            if (times > 3) {
              return null;
            }
            return Math.min(times * 200, 1000);
          },
        },
      },
      strategy: {
        debug: env.bool("REST_CACHE_DEBUG", false),
        enableEtagSupport: true,
        enableXCacheHeaders: true,
        enableAdminCTBMiddleware: true,
        resetOnStartup: false,
        clearRelatedCache: true,

        // Content types to cache (READ-heavy collections)
        contentTypes: [
          // Core content collections (cache aggressively)
          {
            contentType: "api::experience.experience",
            maxAge: 3600000, // 1 hour
            hitpass: false,
          },
          {
            contentType: "api::tour.tour",
            maxAge: 3600000, // 1 hour
            hitpass: false,
          },
          {
            contentType: "api::merchandise.merchandise",
            maxAge: 1800000, // 30 minutes
            hitpass: false,
          },
          {
            contentType: "api::rental.rental",
            maxAge: 1800000, // 30 minutes
            hitpass: false,
          },
          {
            contentType: "api::event.event",
            maxAge: 900000, // 15 minutes (events may have date-sensitive data)
            hitpass: false,
          },

          // Static/reference data (cache very aggressively)
          {
            contentType: "api::experience-category.experience-category",
            maxAge: 86400000, // 24 hours
            hitpass: false,
          },
          {
            contentType: "api::merchandise-category.merchandise-category",
            maxAge: 86400000, // 24 hours
            hitpass: false,
          },
          {
            contentType: "api::location.location",
            maxAge: 7200000, // 2 hours
            hitpass: false,
          },
          {
            contentType: "api::banner.banner",
            maxAge: 1800000, // 30 minutes
            hitpass: false,
          },
          {
            contentType: "api::faq.faq",
            maxAge: 7200000, // 2 hours
            hitpass: false,
          },
          {
            contentType: "api::terms-and-condition.terms-and-condition",
            maxAge: 86400000, // 24 hours (rarely changes)
            hitpass: false,
          },
          {
            contentType: "api::voucher-template.voucher-template",
            maxAge: 3600000, // 1 hour
            hitpass: false,
          },

          // DO NOT CACHE (transactional/user-specific data):
          // - api::order.order (legacy orders)
          // - api::v2-order.v2-order (current orders)
          // - api::tour-booking.tour-booking (bookings)
          // - api::voucher.voucher (user-specific vouchers)
          // - api::review.review (frequently updated, needs fresh data)
        ],

        // Cache key configuration
        keysPrefix: "strapi-cache",

        // Headers to include in cache key (ensures unique cache per query)
        headers: ["accept", "accept-encoding", "accept-language"],
      },
    },
  },
});
