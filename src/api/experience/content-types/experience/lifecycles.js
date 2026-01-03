/**
 * Experience Lifecycle Hooks
 * Auto-compute price and duration fields for efficient filtering
 */

module.exports = {
  /**
   * Compute min prices and duration before creating an experience
   */
  async beforeCreate(event) {
    const { data } = event.params;
    computeMinPrices(data);
    computeMinDuration(data);
  },

  /**
   * Compute min prices and duration before updating an experience
   */
  async beforeUpdate(event) {
    const { data } = event.params;
    computeMinPrices(data);
    computeMinDuration(data);
  },
};

/**
 * Helper function to compute minimum prices from options
 * @param {Object} data - Experience data
 */
function computeMinPrices(data) {
  if (!data.options || data.options.length === 0) {
    // No pricing data, set to null
    data.minPriceUSD = null;
    data.minPriceLKR = null;
    return;
  }

  const usdPrices = [];
  const lkrPrices = [];

  // Extract all USD and LKR prices from options > paxRates
  for (const option of data.options) {
    if (option.paxRates && option.paxRates.length > 0) {
      for (const paxRate of option.paxRates) {
        if (paxRate.rates) {
          if (paxRate.rates.USD !== null && paxRate.rates.USD !== undefined) {
            usdPrices.push(paxRate.rates.USD);
          }
          if (paxRate.rates.LKR !== null && paxRate.rates.LKR !== undefined) {
            lkrPrices.push(paxRate.rates.LKR);
          }
        }
      }
    }
  }

  // Set minimum prices
  data.minPriceUSD = usdPrices.length > 0 ? Math.min(...usdPrices) : null;
  data.minPriceLKR = lkrPrices.length > 0 ? Math.min(...lkrPrices) : null;

  console.log(
    `[Experience Lifecycle] Computed prices - USD: $${data.minPriceUSD}, LKR: රු${data.minPriceLKR}`
  );
}

/**
 * Helper function to compute minimum duration in hours
 * Converts all durations to hours for consistent filtering
 * @param {Object} data - Experience data
 */
function computeMinDuration(data) {
  if (!data.options || data.options.length === 0) {
    data.minDurationHours = null;
    return;
  }

  const durations = [];

  for (const option of data.options) {
    if (option.duration) {
      const { amount, type } = option.duration;
      let hours = 0;

      // Convert to hours based on type
      switch (type) {
        case "minutes":
          hours = amount / 60;
          break;
        case "hours":
          hours = amount;
          break;
        case "days":
          hours = amount * 24;
          break;
        default:
          hours = amount; // Assume hours if type is unknown
      }

      durations.push(hours);
    }
  }

  // Set minimum duration in hours
  data.minDurationHours =
    durations.length > 0 ? Math.min(...durations) : null;

  console.log(
    `[Experience Lifecycle] Computed min duration: ${data.minDurationHours} hours`
  );
}
