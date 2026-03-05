/**
 * Backfill experience minDuration
 *
 * Usage:
 *   node scripts/backfill-experience-duration.js
 *   node scripts/backfill-experience-duration.js --dry-run
 */

const { createStrapi } = require("@strapi/strapi");
const {
  computeExperienceDurationFields,
} = require("../src/utils/experience-duration");

const isDryRun = process.argv.includes("--dry-run");

async function main() {
  let app;
  const summary = {
    scanned: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
  };

  try {
    app = await createStrapi();
    await app.load();

    const experiences = await app.db
      .query("api::experience.experience")
      .findMany({
        select: ["id", "name", "minDuration"],
        populate: {
          options: {
            populate: ["duration"],
          },
        },
      });

    summary.scanned = experiences.length;

    for (const experience of experiences) {
      try {
        const { minDuration } = computeExperienceDurationFields(experience.options);

        const changed =
          Number(experience.minDuration ?? NaN) !== Number(minDuration ?? NaN);

        if (!changed) {
          summary.skipped += 1;
          continue;
        }

        if (!isDryRun) {
          await app.db.query("api::experience.experience").update({
            where: { id: experience.id },
            data: {
              minDuration,
            },
          });
        }

        summary.updated += 1;
      } catch (error) {
        summary.failed += 1;
        console.error(
          `[backfill-experience-duration] Failed id=${experience.id}:`,
          error.message,
        );
      }
    }

    console.log(
      `[backfill-experience-duration] scanned=${summary.scanned} updated=${summary.updated} skipped=${summary.skipped} failed=${summary.failed}${isDryRun ? " (dry-run)" : ""}`,
    );
  } catch (error) {
    console.error("[backfill-experience-duration] Fatal:", error);
    process.exitCode = 1;
  } finally {
    if (app) {
      await app.destroy();
    }
  }
}

main();
