/**
 * Tour Lifecycle Hooks (Strapi v5)
 * Auto-calculates minPriceUSD and minPriceLKR
 */

const { calculateMinPrices_Tour } = require("../../../../utils/pricing");

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;

    // Guard clause: Only run if pricing fields exist
    if (
      !data.paxRates ||
      !Array.isArray(data.paxRates) ||
      data.paxRates.length === 0
    ) {
      return;
    }

    try {
      const { minPriceUSD, minPriceLKR } = calculateMinPrices_Tour({
        paxRates: data.paxRates,
        offer: data.offer,
      });

      data.minPriceUSD = minPriceUSD;
      data.minPriceLKR = minPriceLKR;
    } catch (error) {
      console.error(
        "[tour beforeCreate] Error calculating min prices:",
        error.message,
      );
    }
  },

  async beforeUpdate(event) {
    const { data, where } = event.params;

    try {
      if (!strapi?.db?.query) {
        console.warn("[tour beforeUpdate] strapi.db.query not available");
        return;
      }

      const id = where?.id || where?.documentId;
      if (!id) {
        console.warn("[tour beforeUpdate] No id found");
        return;
      }

      const existing = await strapi.db.query("api::tour.tour").findOne({
        where: { id },
        populate: {
          paxRates: {
            populate: ["rates"],
          },
        },
      });

      if (!existing) {
        console.warn(`[tour beforeUpdate] Tour ${id} not found`);
        return;
      }

      // Use updated values if provided, otherwise use existing
      const paxRates = data.paxRates || existing.paxRates;
      const offer = data.offer !== undefined ? data.offer : existing.offer;

      // Only recalculate if pricing fields changed OR minPrices are missing
      const pricingFieldsChanged = data.paxRates || data.offer !== undefined;
      const minPricesMissing = !existing.minPriceUSD || !existing.minPriceLKR;

      if (pricingFieldsChanged || minPricesMissing) {
        const { minPriceUSD, minPriceLKR } = calculateMinPrices_Tour({
          paxRates,
          offer,
        });

        data.minPriceUSD = minPriceUSD;
        data.minPriceLKR = minPriceLKR;
      }
    } catch (error) {
      console.error(
        "[tour beforeUpdate] Error calculating min prices:",
        error.message,
      );
    }
  },
};
