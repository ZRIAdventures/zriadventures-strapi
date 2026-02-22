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
      // In Strapi v5 publish flow, options.option may come as ID-only entries.
      // Fetch draft document with populated cost objects when needed.
      const hasCostData = data.options.option.some(
        (opt) => opt.cost && (opt.cost.USD != null || opt.cost.LKR != null),
      );

      let options = data.options;

      if (!hasCostData) {
        const documentId = event.params.documentId;
        if (documentId && strapi?.documents) {
          const draft = await strapi
            .documents("api::merchandise.merchandise")
            .findOne({
              documentId,
              status: "draft",
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

          if (draft?.options?.option?.length > 0) {
            options = draft.options;
          } else {
            return;
          }
        } else {
          return;
        }
      }

      const { minPriceUSD, minPriceLKR } = calculateMinPrices_Merchandise({
        options,
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

      const hasFullOptionsData =
        data.options &&
        data.options.option &&
        Array.isArray(data.options.option) &&
        data.options.option.length > 0 &&
        data.options.option[0].cost !== undefined;

      const options = hasFullOptionsData ? data.options : existing.options;
      const offer = data.offer !== undefined ? data.offer : existing.offer;

      // Only recalculate if pricing fields changed OR minPrices are missing
      const pricingFieldsChanged =
        hasFullOptionsData || data.offer !== undefined;
      const minPricesMissing =
        existing.minPriceUSD == null || existing.minPriceLKR == null;

      if (pricingFieldsChanged || minPricesMissing) {
        const { minPriceUSD, minPriceLKR } = calculateMinPrices_Merchandise({
          options,
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
