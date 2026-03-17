"use strict";

/**
 * Fix components_tour_itinerary_days column types.
 *
 * When a Strapi field type changes (e.g. json → enumeration, json → string),
 * Strapi v5 does NOT automatically alter the PostgreSQL column type.
 * This migration converts any json/jsonb columns that should be varchar back
 * to the correct types so saves no longer throw "invalid input syntax for type json".
 *
 * Safe to run multiple times — each ALTER is guarded by a column-type check.
 */

const TABLE = "components_tour_itinerary_days";

const COLUMNS_TO_FIX = [
  // field name in DB   → target SQL type
  { column: "meals", type: "character varying(255)" },
  { column: "accommodation", type: "character varying(255)" },
];

async function isJsonColumn(knex, table, column) {
  const row = await knex("information_schema.columns")
    .where({ table_name: table, column_name: column })
    .whereIn("data_type", ["json", "jsonb"])
    .first();
  return Boolean(row);
}

module.exports = {
  async up(knex) {
    for (const { column, type } of COLUMNS_TO_FIX) {
      const needsFix = await isJsonColumn(knex, TABLE, column);
      if (needsFix) {
        console.log(
          `[migration] Altering ${TABLE}.${column} from json → ${type}`
        );
        await knex.raw(
          `ALTER TABLE ?? ALTER COLUMN ?? TYPE ${type} USING ??::text`,
          [TABLE, column, column]
        );
      }
    }
  },

  async down(knex) {
    for (const { column } of COLUMNS_TO_FIX) {
      const isAlreadyJson = await isJsonColumn(knex, TABLE, column);
      if (!isAlreadyJson) {
        await knex.raw(`ALTER TABLE ?? ALTER COLUMN ?? TYPE jsonb USING ??::jsonb`, [
          TABLE,
          column,
          column,
        ]);
      }
    }
  },
};
