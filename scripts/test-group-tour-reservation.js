/* eslint-disable no-console */

const baseUrl = process.env.STRAPI_BASE_URL || "http://localhost:1337";
const apiKey = process.env.STRAPI_API_KEY;
const departureId = process.env.DEPARTURE_ID;
const pax = Number(process.env.PAX || "1");
const attempts = Number(process.env.ATTEMPTS || "5");

if (!apiKey || !departureId) {
  console.error(
    "Missing STRAPI_API_KEY or DEPARTURE_ID env vars for reservation test."
  );
  process.exit(1);
}

async function reserveOnce() {
  const response = await fetch(
    `${baseUrl}/api/group-tour-departures/${departureId}/reserve`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ pax }),
    }
  );

  if (!response.ok) {
    return { ok: false, status: response.status, body: await response.text() };
  }

  return { ok: true, body: await response.json() };
}

async function main() {
  const promises = Array.from({ length: attempts }, () => reserveOnce());
  const results = await Promise.all(promises);

  const successes = results.filter((r) => r.ok);
  const failures = results.filter((r) => !r.ok);

  console.log(`Attempts: ${attempts}`);
  console.log(`Successes: ${successes.length}`);
  console.log(`Failures: ${failures.length}`);

  if (successes.length === 0) {
    console.error("No reservations succeeded; check capacity or status.");
    process.exit(1);
  }

  const last = successes[successes.length - 1]?.body;
  console.log("Last successful reservation response:", last);
}

main().catch((error) => {
  console.error("Reservation concurrency test failed:", error);
  process.exit(1);
});
