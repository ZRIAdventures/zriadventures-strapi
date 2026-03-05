const { createStrapi } = require("@strapi/strapi");

async function verifyFields() {
  console.log("🔍 Verifying computed fields in database...\n");

  const instance = await createStrapi();
  await instance.load();
  console.log("✅ Strapi loaded successfully\n");

  try {
    // Check a few experiences
    console.log("📦 Checking Experiences...");
    const experiences = await instance.db
      .query("api::experience.experience")
      .findMany({
        limit: 5,
        select: [
          "id",
          "documentId",
          "name",
          "minPriceUSD",
          "minPriceLKR",
          "minDuration",
        ],
      });

    console.log(`Found ${experiences.length} experiences:`);
    experiences.forEach((exp) => {
      console.log(`  - ${exp.name || "Unnamed"} (ID: ${exp.id})`);
      console.log(`    minPriceUSD: ${exp.minPriceUSD}`);
      console.log(`    minPriceLKR: ${exp.minPriceLKR}`);
      console.log(`    minDuration: ${exp.minDuration}`);
      console.log("");
    });

    // Check tours
    console.log("\n📦 Checking Tours...");
    const tours = await instance.db.query("api::tour.tour").findMany({
      limit: 5,
      select: [
        "id",
        "documentId",
        "title",
        "minPriceUSD",
        "minPriceLKR",
        "durationBucket",
      ],
    });

    console.log(`Found ${tours.length} tours:`);
    tours.forEach((tour) => {
      console.log(`  - ${tour.title || "Unnamed"} (ID: ${tour.id})`);
      console.log(`    minPriceUSD: ${tour.minPriceUSD}`);
      console.log(`    minPriceLKR: ${tour.minPriceLKR}`);
      console.log(`    durationBucket: ${tour.durationBucket}`);
      console.log("");
    });

    // Check merchandise
    console.log("\n📦 Checking Merchandise...");
    const merchandises = await instance.db
      .query("api::merchandise.merchandise")
      .findMany({
        limit: 5,
        select: ["id", "documentId", "name", "minPriceUSD", "minPriceLKR"],
      });

    console.log(`Found ${merchandises.length} merchandise:`);
    merchandises.forEach((merch) => {
      console.log(`  - ${merch.name || "Unnamed"} (ID: ${merch.id})`);
      console.log(`    minPriceUSD: ${merch.minPriceUSD}`);
      console.log(`    minPriceLKR: ${merch.minPriceLKR}`);
      console.log("");
    });

    console.log("✅ Verification complete!");
  } catch (error) {
    console.error("❌ Error during verification:", error);
  } finally {
    await instance.destroy();
    process.exit(0);
  }
}

verifyFields();
