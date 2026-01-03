/**
 * Tour Lifecycle Hooks
 * Auto-compute price fields for efficient filtering
 */

module.exports = {
  /**
   * Compute min prices before creating a tour
   */
  async beforeCreate(event) {
    const { data } = event.params;
    computeMinPrices(data);
  },

  /**
   * Compute min prices before updating a tour
   */
  async beforeUpdate(event) {
    const { data } = event.params;
    computeMinPrices(data);
  },
};

/**
 * Helper function to compute minimum prices from paxRates
 * @param {Object} data - Tour data
 */
function computeMinPrices(data) {
  if (!data.paxRates || data.paxRates.length === 0) {
    // No pricing data, set to null
    data.minPriceUSD = null;
    data.minPriceLKR = null;
    return;
  }

  const usdPrices = [];
  const lkrPrices = [];

  // Extract all USD and LKR prices from paxRates
  for (const paxRate of data.paxRates) {
    if (paxRate.rates) {
      if (paxRate.rates.USD !== null && paxRate.rates.USD !== undefined) {
        usdPrices.push(paxRate.rates.USD);
      }
      if (paxRate.rates.LKR !== null && paxRate.rates.LKR !== undefined) {
        lkrPrices.push(paxRate.rates.LKR);
      }
    }
  }

  // Set minimum prices
  data.minPriceUSD = usdPrices.length > 0 ? Math.min(...usdPrices) : null;
  data.minPriceLKR = lkrPrices.length > 0 ? Math.min(...lkrPrices) : null;

  console.log(
    `[Tour Lifecycle] Computed prices - USD: $${data.minPriceUSD}, LKR: රු${data.minPriceLKR}`
  );
}
