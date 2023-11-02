'use strict';

/**
 * rental service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::rental.rental');
