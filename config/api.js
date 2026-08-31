module.exports = {
  rest: {
    // zriadventures-web's largest known query is sitemap generation at
    // pageSize: 300 (lib/strapi/endpoints/sitemap.ts) - maxLimit keeps
    // headroom above that without leaving pagination wide open for
    // bulk-scraping/DoS via ?pagination[limit]=.
    defaultLimit: 25,
    maxLimit: 500,
    withCount: true,
  },
};
