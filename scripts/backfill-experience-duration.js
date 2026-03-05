/**
 * Backfill experience minDuration
 *
 * Usage:
 *   node scripts/backfill-experience-duration.js
 *   node scripts/backfill-experience-duration.js --dry-run
 *   node scripts/backfill-experience-duration.js --batch-size=100 --verbose
 */

const { createStrapi } = require("@strapi/strapi");
const {
  computeExperienceDurationFields,
} = require("../src/utils/experience-duration");

const isDryRun = process.argv.includes("--dry-run");
const isVerbose = process.argv.includes("--verbose");

function getNumericArg(name, defaultValue) {
  const prefix = `--${name}=`;
  const raw = process.argv.find((arg) => arg.startsWith(prefix));
  if (!raw) return defaultValue;
  const value = Number(raw.slice(prefix.length));
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : defaultValue;
}

const batchSize = getNumericArg("batch-size", 100);
const startId = getNumericArg("start-id", 0);
const maxRecords = getNumericArg("max-records", Number.MAX_SAFE_INTEGER);

async function main() {
  let app;
  const startedAt = Date.now();
  const summary = {
    totalInDb: 0,
    scanned: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    batches: 0,
  };

  try {
    app = await createStrapi();
    await app.load();

    const query = app.db.query("api::experience.experience");
    const totalInDb = await query.count();
    summary.totalInDb = totalInDb;

    console.log(
      `[backfill-experience-duration] start dryRun=${isDryRun} batchSize=${batchSize} startId=${startId} maxRecords=${maxRecords} totalInDb=${totalInDb}`,
    );

    let lastId = startId;
    while (summary.scanned < maxRecords) {
      const remaining = maxRecords - summary.scanned;
      const currentBatchSize = Math.min(batchSize, remaining);
      const batchStartedAt = Date.now();

      const experiences = await query.findMany({
        where: { id: { $gt: lastId } },
        orderBy: { id: "asc" },
        limit: currentBatchSize,
        select: ["id", "name", "minDuration"],
        populate: {
          options: {
            populate: ["duration"],
          },
        },
      });

      if (experiences.length === 0) {
        break;
      }

      summary.batches += 1;
      console.log(
        `[backfill-experience-duration] batch=${summary.batches} size=${experiences.length} idRange=${experiences[0].id}-${experiences[experiences.length - 1].id}`,
      );

      for (const experience of experiences) {
        summary.scanned += 1;
        lastId = experience.id;

        try {
          const { minDuration } = computeExperienceDurationFields(
            experience.options,
          );

          const changed =
            Number(experience.minDuration ?? NaN) !== Number(minDuration ?? NaN);

          if (!changed) {
            summary.skipped += 1;
            if (isVerbose) {
              console.log(
                `[backfill-experience-duration] id=${experience.id} skipped unchanged minDuration=${experience.minDuration}`,
              );
            }
            continue;
          }

          if (!isDryRun) {
            await query.update({
              where: { id: experience.id },
              data: {
                minDuration,
              },
            });
          }

          summary.updated += 1;
          if (isVerbose) {
            console.log(
              `[backfill-experience-duration] id=${experience.id} updated minDuration=${minDuration}`,
            );
          }
        } catch (error) {
          summary.failed += 1;
          console.error(
            `[backfill-experience-duration] id=${experience.id} failed: ${error.message}`,
          );
        }
      }

      const batchElapsedMs = Date.now() - batchStartedAt;
      console.log(
        `[backfill-experience-duration] batch=${summary.batches} done elapsedMs=${batchElapsedMs} scanned=${summary.scanned} updated=${summary.updated} skipped=${summary.skipped} failed=${summary.failed}`,
      );
    }

    const elapsedMs = Date.now() - startedAt;
    console.log(
      `[backfill-experience-duration] completed scanned=${summary.scanned} updated=${summary.updated} skipped=${summary.skipped} failed=${summary.failed} batches=${summary.batches} elapsedMs=${elapsedMs}${isDryRun ? " (dry-run)" : ""}`,
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
