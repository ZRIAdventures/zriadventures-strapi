/**
 * Database Migration: Add indexes for price and duration filtering
 *
 * Run this script to add performance indexes:
 * node scripts/add-filter-indexes.js
 */

const strapi = require("@strapi/strapi").default;

async function addIndexes() {
  console.log("🔧 Adding database indexes for filtering performance...\n");

  let instance;
  try {
    const { createStrapi } = require("@strapi/strapi");
    instance = await createStrapi().load();
    const knex = instance.db.connection;

    console.log("✅ Connected to database\n");

    // Get table names
    const experiencesTable = "experiences";
    const toursTable = "tours";
    const merchandisesTable = "merchandises";

    // Add indexes for Experiences
    console.log("📊 Adding indexes to experiences table...");
    try {
      await knex.schema.table(experiencesTable, (table) => {
        table.index(["min_price_usd"], "idx_experiences_min_price_usd");
        table.index(["min_price_lkr"], "idx_experiences_min_price_lkr");
        table.index(
          ["min_duration_hours"],
          "idx_experiences_min_duration_hours",
        );
        table.index(["duration_bucket"], "idx_experiences_duration_bucket");
        // Composite indexes for common filter combinations
        table.index(
          ["min_price_usd", "duration_bucket"],
          "idx_experiences_price_usd_duration",
        );
        table.index(
          ["min_price_lkr", "duration_bucket"],
          "idx_experiences_price_lkr_duration",
        );
      });
      console.log("✅ Experiences indexes added\n");
    } catch (error) {
      if (error.message.includes("already exists")) {
        console.log("⚠️  Experiences indexes already exist\n");
      } else {
        throw error;
      }
    }

    // Add indexes for Tours
    console.log("📊 Adding indexes to tours table...");
    try {
      await knex.schema.table(toursTable, (table) => {
        table.index(["min_price_usd"], "idx_tours_min_price_usd");
        table.index(["min_price_lkr"], "idx_tours_min_price_lkr");
        table.index(["duration_bucket"], "idx_tours_duration_bucket");
        table.index(["duration_days"], "idx_tours_duration_days");
        // Composite indexes
        table.index(
          ["min_price_usd", "duration_bucket"],
          "idx_tours_price_usd_duration",
        );
        table.index(
          ["min_price_lkr", "duration_bucket"],
          "idx_tours_price_lkr_duration",
        );
      });
      console.log("✅ Tours indexes added\n");
    } catch (error) {
      if (error.message.includes("already exists")) {
        console.log("⚠️  Tours indexes already exist\n");
      } else {
        throw error;
      }
    }

    // Add indexes for Merchandise
    console.log("📊 Adding indexes to merchandises table...");
    try {
      await knex.schema.table(merchandisesTable, (table) => {
        table.index(["min_price_usd"], "idx_merchandises_min_price_usd");
        table.index(["min_price_lkr"], "idx_merchandises_min_price_lkr");
      });
      console.log("✅ Merchandise indexes added\n");
    } catch (error) {
      if (error.message.includes("already exists")) {
        console.log("⚠️  Merchandise indexes already exist\n");
      } else {
        throw error;
      }
    }

    console.log("🎉 All indexes added successfully!\n");
    instance.destroy();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding indexes:", error);
    if (instance) {
      await instance;
      await strapi.destroy();
    }
    process.exit(1);
  }
}

addIndexes();
