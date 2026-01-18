/**
 * Experience Lifecycle Hooks (Strapi v5)
 * Auto-calculates minPriceUSD and minPriceLKR
 */

const { calculateMinPrices_Experience } = require("../../../../utils/pricing");

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;

    // Guard clause: Only run if pricing fields exist
    if (
      !data.options ||
      !Array.isArray(data.options) ||
      data.options.length === 0
    ) {
      return;
    }

    try {
      const { minPriceUSD, minPriceLKR } = calculateMinPrices_Experience({
        options: data.options,
        offer: data.offer,
      });

      data.minPriceUSD = minPriceUSD;
      data.minPriceLKR = minPriceLKR;
    } catch (error) {
      console.error(
        "[experience beforeCreate] Error calculating min prices:",
        error.message,
      );
    }
  },

  async beforeUpdate(event) {
    const { data, where } = event.params;

    try {
      if (!strapi?.db?.query) {
        return;
      }

      const id = where?.id || where?.documentId;
      if (!id) {
        return;
      }

      const existing = await strapi.db
        .query("api::experience.experience")
        .findOne({
          where: { id },
          populate: {
            options: {
              populate: {
                paxRates: {
                  populate: ["rates"],
                },
              },
            },
          },
        });

      if (!existing) {
        return;
      }

      // Check if data.options has full populated data or just relation IDs
      const hasFullOptionsData = data.options?.[0]?.paxRates !== undefined;
      const options = hasFullOptionsData ? data.options : existing.options;
      const offer = data.offer !== undefined ? data.offer : existing.offer;

      // Only recalculate if pricing fields changed OR minPrices are missing
      const pricingFieldsChanged =
        hasFullOptionsData || data.offer !== undefined;
      const minPricesMissing = !existing.minPriceUSD || !existing.minPriceLKR;

      if (pricingFieldsChanged || minPricesMissing) {
        const { minPriceUSD, minPriceLKR } = calculateMinPrices_Experience({
          options,
          offer,
        });

        data.minPriceUSD = minPriceUSD;
        data.minPriceLKR = minPriceLKR;
      }
    } catch (error) {
      console.error(
        "[experience beforeUpdate] Error calculating min prices:",
        error.message,
      );
    }
  },
};
