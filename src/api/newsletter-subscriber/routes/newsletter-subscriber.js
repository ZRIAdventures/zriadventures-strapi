'use strict';
const { createCoreRouter } = require('@strapi/strapi').factories;
// API-token managed only. Do not grant this collection to public roles.
module.exports = createCoreRouter('api::newsletter-subscriber.newsletter-subscriber');
