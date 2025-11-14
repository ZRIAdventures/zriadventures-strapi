'use strict';

/**
 * tour-operator service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::tour-operator.tour-operator');
