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
      // In Strapi v5 publish flow, component data can arrive as ID-only stubs.
      // Fetch the draft document with fully populated options to compute prices.
      const hasRatesData = data.options.some(
        (option) =>
          option.paxRates &&
          Array.isArray(option.paxRates) &&
          option.paxRates.some(
            (paxRate) =>
              paxRate.rates &&
              (paxRate.rates.USD != null || paxRate.rates.LKR != null),
          ),
      );

      let options = data.options;

      if (!hasRatesData) {
        const documentId = event.params.documentId;
        if (documentId && strapi?.documents) {
          const draft = await strapi
            .documents("api::experience.experience")
            .findOne({
              documentId,
              status: "draft",
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

          if (draft?.options?.length > 0) {
            options = draft.options;
          } else {
            return;
          }
        } else {
          return;
        }
      }

      const { minPriceUSD, minPriceLKR } = calculateMinPrices_Experience({
        options,
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

      // During admin updates, options may come as ID-only component entries.
      const hasFullOptionsData =
        data.options &&
        Array.isArray(data.options) &&
        data.options.length > 0 &&
        data.options[0].paxRates !== undefined &&
        Array.isArray(data.options[0].paxRates) &&
        data.options[0].paxRates[0]?.rates !== undefined;
      const options = hasFullOptionsData ? data.options : existing.options;
      const offer = data.offer !== undefined ? data.offer : existing.offer;

      // Only recalculate if pricing fields changed OR minPrices are missing
      const pricingFieldsChanged =
        hasFullOptionsData || data.offer !== undefined;
      const minPricesMissing =
        existing.minPriceUSD == null || existing.minPriceLKR == null;

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
