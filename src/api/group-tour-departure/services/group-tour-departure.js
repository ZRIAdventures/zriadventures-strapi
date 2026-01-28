'use strict';

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService(
  'api::group-tour-departure.group-tour-departure',
  ({ strapi }) => ({
    async reserve(id, pax) {
      const knex = strapi.db.connection;

      const result = await knex.raw(
        `
          UPDATE group_tour_departures
          SET booked_count = booked_count + ?,
              group_status = CASE
                WHEN booked_count + ? >= max_capacity THEN 'full'
                ELSE group_status
              END
          WHERE id = ?
            AND group_status = 'open'
            AND booked_count + ? <= max_capacity
          RETURNING id, booked_count, max_capacity, group_status
        `,
        [pax, pax, id, pax]
      );

      const row = result?.rows?.[0] ?? result?.[0]?.[0];

      if (!row) {
        throw new Error('Capacity full or departure closed');
      }

      return row;
    },

    async release(id, pax) {
      const knex = strapi.db.connection;

      const result = await knex.raw(
        `
          UPDATE group_tour_departures
          SET booked_count = GREATEST(booked_count - ?, 0),
              group_status = CASE
                WHEN group_status = 'closed' THEN 'closed'
                WHEN booked_count - ? < max_capacity THEN 'open'
                ELSE group_status
              END
          WHERE id = ?
          RETURNING id, booked_count, max_capacity, group_status
        `,
        [pax, pax, id]
      );

      const row = result?.rows?.[0] ?? result?.[0]?.[0];

      if (!row) {
        throw new Error('Release failed');
      }

      return row;
    },
  })
);
