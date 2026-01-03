/**
 * Event Lifecycle Hooks
 * Auto-compute price fields for efficient filtering
 */

module.exports = {
  /**
   * Compute min prices before creating event
   */
  async beforeCreate(event) {
    const { data } = event.params;
    computeMinPrices(data);
  },

  /**
   * Compute min prices before updating event
   */
  async beforeUpdate(event) {
    const { data } = event.params;
    computeMinPrices(data);
  },
};

/**
 * Helper function to compute minimum prices from cost
 * Events have a simpler structure - just a single cost component
 * @param {Object} data - Event data
 */
function computeMinPrices(data) {
  if (!data.cost) {
    // No pricing data, set to null
    data.minPriceUSD = null;
    data.minPriceLKR = null;
    return;
  }

  // Events have direct cost field
  data.minPriceUSD = data.cost.USD !== null && data.cost.USD !== undefined
    ? data.cost.USD
    : null;
  data.minPriceLKR = data.cost.LKR !== null && data.cost.LKR !== undefined
    ? data.cost.LKR
    : null;

  console.log(
    `[Event Lifecycle] Computed prices - USD: $${data.minPriceUSD}, LKR: රු${data.minPriceLKR}`
  );
}
