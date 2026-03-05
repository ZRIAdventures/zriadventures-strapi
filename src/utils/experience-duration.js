/**
 * Experience duration helpers
 */

const HOURS_PER_DAY = 24;

function durationToHours(duration) {
  if (!duration || duration.amount == null || !duration.type) {
    return null;
  }

  const amount = Number(duration.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  const normalizedType = String(duration.type).trim().toLowerCase();
  if (normalizedType === "minutes") {
    return amount / 60;
  }
  if (normalizedType === "hours") {
    return amount;
  }
  if (normalizedType === "days") {
    return amount * HOURS_PER_DAY;
  }

  return null;
}

function getMinDurationFromOptions(options) {
  if (!Array.isArray(options) || options.length === 0) {
    return null;
  }

  const durations = options
    .map((option) => durationToHours(option?.duration))
    .filter((value) => typeof value === "number" && Number.isFinite(value));

  if (durations.length === 0) {
    return null;
  }

  return Math.min(...durations);
}

function computeExperienceDurationFields(options) {
  const minDuration = getMinDurationFromOptions(options);
  return {
    minDuration,
  };
}

module.exports = {
  durationToHours,
  getMinDurationFromOptions,
  computeExperienceDurationFields,
};
