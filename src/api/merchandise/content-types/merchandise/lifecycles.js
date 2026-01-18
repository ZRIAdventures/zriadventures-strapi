/**
 * Merchandise Lifecycle Hooks (Strapi v5)
 * Auto-calculates minPriceUSD and minPriceLKR
 */

const { calculateMinPrices_Merchandise } = require("../../../../utils/pricing");

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;

    // Guard clause: Only run if pricing fields exist
    if (
      !data.options?.option ||
      !Array.isArray(data.options.option) ||
      data.options.option.length === 0
    ) {
      return;
    }

    try {
      const { minPriceUSD, minPriceLKR } = calculateMinPrices_Merchandise({
        options: data.options,
        offer: data.offer,
      });

      data.minPriceUSD = minPriceUSD;
      data.minPriceLKR = minPriceLKR;
    } catch (error) {
      console.error(
        "[merchandise beforeCreate] Error calculating min prices:",
        error.message,
      );
    }
  },

  async beforeUpdate(event) {
    const { data, where } = event.params;

    try {
      if (!strapi?.db?.query) {
        console.warn(
          "[merchandise beforeUpdate] strapi.db.query not available",
        );
        return;
      }

      const id = where?.id || where?.documentId;
      if (!id) {
        console.warn("[merchandise beforeUpdate] No id found");
        return;
      }

      const existing = await strapi.db
        .query("api::merchandise.merchandise")
        .findOne({
          where: { id },
          populate: {
            options: {
              populate: {
                option: {
                  populate: ["cost"],
                },
              },
            },
          },
        });

      if (!existing) {
        console.warn(`[merchandise beforeUpdate] Merchandise ${id} not found`);
        return;
      }

      // Use updated values if provided, otherwise use existing
      const options = data.options?.option || existing.options?.option;
      const offer = data.offer !== undefined ? data.offer : existing.offer;

      // Only recalculate if pricing fields changed OR minPrices are missing
      const pricingFieldsChanged = data.options || data.offer !== undefined;
      const minPricesMissing = !existing.minPriceUSD || !existing.minPriceLKR;

      if (pricingFieldsChanged || minPricesMissing) {
        const { minPriceUSD, minPriceLKR } = calculateMinPrices_Merchandise({
          options: { option: options },
          offer,
        });

        data.minPriceUSD = minPriceUSD;
        data.minPriceLKR = minPriceLKR;
      }
    } catch (error) {
      console.error(
        "[merchandise beforeUpdate] Error calculating min prices:",
        error.message,
      );
    }
  },
};
