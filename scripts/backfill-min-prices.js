/**
 * Backfill Minimum Prices for Existing Records
 *
 * This script calculates and updates minPriceUSD and minPriceLKR
 * for all existing Experiences, Tours, and Merchandises.
 *
 * Usage:
 *   node scripts/backfill-min-prices.js
 *
 * Options:
 *   --dry-run    Show what would be updated without saving
 *   --collection [experience|tour|merchandise]   Only update specific collection
 */

const { createStrapi } = require("@strapi/strapi");
const {
  calculateMinPrices_Experience,
  calculateMinPrices_Tour,
  calculateMinPrices_Merchandise,
} = require("../src/utils/pricing");

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const collectionArg = args.find((arg) => arg.startsWith("--collection="));
const targetCollection = collectionArg ? collectionArg.split("=")[1] : null;

let updatedCount = 0;
let skippedCount = 0;
let errorCount = 0;

/**
 * Process a single collection type
 */
async function processCollection(
  app,
  collectionName,
  calculateFn,
  populateConfig,
) {
  console.log(`\n📦 Processing ${collectionName}...`);

  try {
    // Fetch all records with necessary relations
    const records = await app.db
      .query(`api::${collectionName}.${collectionName}`)
      .findMany({
        populate: populateConfig,
      });

    console.log(`Found ${records.length} ${collectionName} records\n`);

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const recordNum = i + 1;

      try {
        // Calculate prices - pass data in the format expected by the functions
        const { minPriceUSD, minPriceLKR } = calculateFn(record);

        // Check if prices changed
        const pricesChanged =
          record.minPriceUSD !== minPriceUSD ||
          record.minPriceLKR !== minPriceLKR;

        if (!pricesChanged) {
          console.log(
            `[${recordNum}/${records.length}] ⏭️  Skipped: "${record.name || record.title}" ` +
              `(prices unchanged: $${minPriceUSD} / LKR ${minPriceLKR})`,
          );
          skippedCount++;
          continue;
        }

        // Log the update
        console.log(
          `[${recordNum}/${records.length}] 💰 ${record.name || record.title}`,
        );
        console.log(
          `  Current: USD ${record.minPriceUSD ?? "null"} / LKR ${record.minPriceLKR ?? "null"}`,
        );
        console.log(`  New:     USD ${minPriceUSD} / LKR ${minPriceLKR}`);

        if (!isDryRun) {
          // Update the record
          await app.db
            .query(`api::${collectionName}.${collectionName}`)
            .update({
              where: { id: record.id },
              data: {
                minPriceUSD,
                minPriceLKR,
              },
            });
          console.log(`  ✅ Updated\n`);
        } else {
          console.log(`  🔍 Would update (dry-run mode)\n`);
        }

        updatedCount++;
      } catch (error) {
        console.error(
          `[${recordNum}/${records.length}] ❌ Error processing "${record.name || record.title}":`,
          error.message,
        );
        errorCount++;
      }
    }
  } catch (error) {
    console.error(`❌ Failed to process ${collectionName}:`, error);
    errorCount++;
  }
}

/**
 * Main function
 */
async function main() {
  console.log("🚀 Starting minimum price backfill...\n");

  if (isDryRun) {
    console.log("⚠️  DRY RUN MODE - No changes will be saved\n");
  }

  if (targetCollection) {
    console.log(`🎯 Target collection: ${targetCollection}\n`);
  }

  let app;
  try {
    // Load Strapi
    console.log("⏳ Loading Strapi...");
    app = await createStrapi();
    await app.load();
    console.log("✅ Strapi loaded\n");

    // Process collections
    const collections = [
      {
        name: "experience",
        calculate: calculateMinPrices_Experience,
        populate: {
          options: {
            populate: {
              paxRates: {
                populate: ["rates"],
              },
            },
          },
        },
      },
      {
        name: "tour",
        calculate: calculateMinPrices_Tour,
        populate: {
          paxRates: {
            populate: ["rates"],
          },
        },
      },
      {
        name: "merchandise",
        calculate: calculateMinPrices_Merchandise,
        populate: {
          options: {
            populate: {
              option: {
                populate: ["cost"],
              },
            },
          },
        },
      },
    ];

    // Filter by target collection if specified
    const collectionsToProcess = targetCollection
      ? collections.filter((c) => c.name === targetCollection)
      : collections;

    if (collectionsToProcess.length === 0) {
      console.error(`❌ Invalid collection: ${targetCollection}`);
      console.log("Valid collections: experience, tour, merchandise");
      process.exit(1);
    }

    // Process each collection
    for (const collection of collectionsToProcess) {
      await processCollection(
        app,
        collection.name,
        collection.calculate,
        collection.populate,
      );
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 Summary:");
    console.log("=".repeat(60));
    console.log(`✅ Updated:  ${updatedCount}`);
    console.log(`⏭️  Skipped:  ${skippedCount} (prices already correct)`);
    console.log(`❌ Errors:   ${errorCount}`);
    console.log("=".repeat(60));

    if (isDryRun) {
      console.log("\n⚠️  This was a DRY RUN - no changes were saved");
      console.log("Run without --dry-run to apply changes");
    }

    console.log("\n✨ Done!\n");
  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  } finally {
    if (app) {
      await app.destroy();
    }
  }
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });
