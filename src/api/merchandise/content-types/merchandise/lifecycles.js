/**
 * Merchandise Lifecycle Hooks
 * Auto-compute price fields for efficient filtering
 */

module.exports = {
  /**
   * Compute min prices before creating merchandise
   */
  async beforeCreate(event) {
    const { data } = event.params;
    computeMinPrices(data);
  },

  /**
   * Compute min prices before updating merchandise
   */
  async beforeUpdate(event) {
    const { data } = event.params;
    computeMinPrices(data);
  },
};

/**
 * Helper function to compute minimum prices from options
 * @param {Object} data - Merchandise data
 */
function computeMinPrices(data) {
  if (!data.options || !data.options.option || data.options.option.length === 0) {
    // No pricing data, set to null
    data.minPriceUSD = null;
    data.minPriceLKR = null;
    return;
  }

  const usdPrices = [];
  const lkrPrices = [];

  // Extract all USD and LKR prices from options
  for (const option of data.options.option) {
    if (option.cost) {
      if (option.cost.USD !== null && option.cost.USD !== undefined) {
        usdPrices.push(option.cost.USD);
      }
      if (option.cost.LKR !== null && option.cost.LKR !== undefined) {
        lkrPrices.push(option.cost.LKR);
      }
    }
  }

  // Set minimum prices
  data.minPriceUSD = usdPrices.length > 0 ? Math.min(...usdPrices) : null;
  data.minPriceLKR = lkrPrices.length > 0 ? Math.min(...lkrPrices) : null;

  console.log(
    `[Merchandise Lifecycle] Computed prices - USD: $${data.minPriceUSD}, LKR: රු${data.minPriceLKR}`
  );
}
