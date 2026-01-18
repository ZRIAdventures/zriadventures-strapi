/**
 * Pricing Utilities for Strapi v5
 *
 * Calculates minimum prices for Experience, Tour, and Merchandise collections
 * Applies discount logic and handles edge cases
 */

/**
 * Apply discount to a price
 * @param {number} price - Base price
 * @param {number} offer - Discount percentage (e.g., 10 for 10%)
 * @returns {number} - Discounted price rounded to 2 decimals
 */
function applyDiscount(price, offer) {
  if (!price || price <= 0) return null;
  if (!offer || offer <= 0) return roundPrice(price);

  const discountedPrice = price - (price * offer) / 100;
  return roundPrice(discountedPrice);
}

/**
 * Round price to 2 decimal places
 * @param {number} price
 * @returns {number}
 */
function roundPrice(price) {
  if (!price || isNaN(price)) return null;
  return Math.round(price * 100) / 100;
}

/**
 * Extract valid prices from array, filtering nulls and invalid values
 * @param {Array} prices - Array of price values
 * @returns {Array} - Filtered valid prices
 */
function filterValidPrices(prices) {
  return prices.filter(
    (price) =>
      price !== null && price !== undefined && !isNaN(price) && price > 0,
  );
}

/**
 * Extract lowest USD price from Experience data
 * Structure: options[].paxRates[].rates.USD
 *
 * @param {Object} data - Experience entity data
 * @returns {number|null} - Lowest USD price or null
 */
function extractLowestPriceUSD_Experience(data) {
  if (!data.options || !Array.isArray(data.options)) {
    return null;
  }

  const allPrices = [];

  data.options.forEach((option) => {
    if (option.paxRates && Array.isArray(option.paxRates)) {
      option.paxRates.forEach((paxRate) => {
        if (paxRate.rates && paxRate.rates.USD) {
          allPrices.push(paxRate.rates.USD);
        }
      });
    }
  });

  const validPrices = filterValidPrices(allPrices);
  return validPrices.length > 0 ? Math.min(...validPrices) : null;
}

/**
 * Extract lowest LKR price from Experience data
 * Structure: options[].paxRates[].rates.LKR
 *
 * @param {Object} data - Experience entity data
 * @returns {number|null} - Lowest LKR price or null
 */
function extractLowestPriceLKR_Experience(data) {
  if (!data.options || !Array.isArray(data.options)) {
    return null;
  }

  const allPrices = [];

  data.options.forEach((option) => {
    if (option.paxRates && Array.isArray(option.paxRates)) {
      option.paxRates.forEach((paxRate) => {
        if (paxRate.rates && paxRate.rates.LKR) {
          allPrices.push(paxRate.rates.LKR);
        }
      });
    }
  });

  const validPrices = filterValidPrices(allPrices);
  return validPrices.length > 0 ? Math.min(...validPrices) : null;
}

/**
 * Extract lowest USD price from Tour data
 * Structure: paxRates[].rates.USD
 *
 * @param {Object} data - Tour entity data
 * @returns {number|null} - Lowest USD price or null
 */
function extractLowestPriceUSD_Tour(data) {
  if (!data.paxRates || !Array.isArray(data.paxRates)) {
    return null;
  }

  const allPrices = data.paxRates
    .filter((paxRate) => paxRate.rates && paxRate.rates.USD)
    .map((paxRate) => paxRate.rates.USD);

  const validPrices = filterValidPrices(allPrices);
  return validPrices.length > 0 ? Math.min(...validPrices) : null;
}

/**
 * Extract lowest LKR price from Tour data
 * Structure: paxRates[].rates.LKR
 *
 * @param {Object} data - Tour entity data
 * @returns {number|null} - Lowest LKR price or null
 */
function extractLowestPriceLKR_Tour(data) {
  if (!data.paxRates || !Array.isArray(data.paxRates)) {
    return null;
  }

  const allPrices = data.paxRates
    .filter((paxRate) => paxRate.rates && paxRate.rates.LKR)
    .map((paxRate) => paxRate.rates.LKR);

  const validPrices = filterValidPrices(allPrices);
  return validPrices.length > 0 ? Math.min(...validPrices) : null;
}

/**
 * Extract lowest USD price from Merchandise data
 * Structure: options.option[].cost.USD
 *
 * @param {Object} data - Merchandise entity data
 * @returns {number|null} - Lowest USD price or null
 */
function extractLowestPriceUSD_Merchandise(data) {
  if (
    !data.options ||
    !data.options.option ||
    !Array.isArray(data.options.option)
  ) {
    return null;
  }

  const allPrices = data.options.option
    .filter((opt) => opt.cost && opt.cost.USD)
    .map((opt) => opt.cost.USD);

  const validPrices = filterValidPrices(allPrices);
  return validPrices.length > 0 ? Math.min(...validPrices) : null;
}

/**
 * Extract lowest LKR price from Merchandise data
 * Structure: options.option[].cost.LKR
 *
 * @param {Object} data - Merchandise entity data
 * @returns {number|null} - Lowest LKR price or null
 */
function extractLowestPriceLKR_Merchandise(data) {
  if (
    !data.options ||
    !data.options.option ||
    !Array.isArray(data.options.option)
  ) {
    return null;
  }

  const allPrices = data.options.option
    .filter((opt) => opt.cost && opt.cost.LKR)
    .map((opt) => opt.cost.LKR);

  const validPrices = filterValidPrices(allPrices);
  return validPrices.length > 0 ? Math.min(...validPrices) : null;
}

/**
 * Calculate minimum prices for Experience
 * @param {Object} data - Experience entity data
 * @returns {Object} - { minPriceUSD, minPriceLKR }
 */
function calculateMinPrices_Experience(data) {
  const baseUSD = extractLowestPriceUSD_Experience(data);
  const baseLKR = extractLowestPriceLKR_Experience(data);
  const offer = data.offer || 0;

  return {
    minPriceUSD: applyDiscount(baseUSD, offer),
    minPriceLKR: applyDiscount(baseLKR, offer),
  };
}

/**
 * Calculate minimum prices for Tour
 * @param {Object} data - Tour entity data
 * @returns {Object} - { minPriceUSD, minPriceLKR }
 */
function calculateMinPrices_Tour(data) {
  const baseUSD = extractLowestPriceUSD_Tour(data);
  const baseLKR = extractLowestPriceLKR_Tour(data);
  const offer = data.offer || 0;

  return {
    minPriceUSD: applyDiscount(baseUSD, offer),
    minPriceLKR: applyDiscount(baseLKR, offer),
  };
}

/**
 * Calculate minimum prices for Merchandise
 * @param {Object} data - Merchandise entity data
 * @returns {Object} - { minPriceUSD, minPriceLKR }
 */
function calculateMinPrices_Merchandise(data) {
  const baseUSD = extractLowestPriceUSD_Merchandise(data);
  const baseLKR = extractLowestPriceLKR_Merchandise(data);
  const offer = data.offer || 0;

  return {
    minPriceUSD: applyDiscount(baseUSD, offer),
    minPriceLKR: applyDiscount(baseLKR, offer),
  };
}

module.exports = {
  // Main functions
  calculateMinPrices_Experience,
  calculateMinPrices_Tour,
  calculateMinPrices_Merchandise,

  // Helper functions (exported for testing)
  applyDiscount,
  roundPrice,
  filterValidPrices,

  // Extraction functions (exported for testing)
  extractLowestPriceUSD_Experience,
  extractLowestPriceLKR_Experience,
  extractLowestPriceUSD_Tour,
  extractLowestPriceLKR_Tour,
  extractLowestPriceUSD_Merchandise,
  extractLowestPriceLKR_Merchandise,
};
