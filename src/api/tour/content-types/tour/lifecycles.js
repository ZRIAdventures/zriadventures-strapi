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
      // In Strapi v5, during a publish operation the Entity Service creates the
      // published entity row. At that point data.paxRates may carry only ID
      // references without the nested rates sub-component (the component rows
      // already exist in the DB from draft creation and aren't re-inlined).
      // Detect this and fall back to fetching the draft document so that the
      // published entity gets correct minPriceUSD/minPriceLKR from the start.
      const hasRatesData = data.paxRates.some(
        (pr) => pr.rates && (pr.rates.USD != null || pr.rates.LKR != null),
      );

      let paxRates = data.paxRates;

      if (!hasRatesData) {
        // documentId is available when the hook fires via the Document Service
        // (i.e. publish flow). Not available for a plain entity-level create.
        const documentId = event.params.documentId;
        if (documentId && strapi?.documents) {
          const draft = await strapi.documents("api::tour.tour").findOne({
            documentId,
            status: "draft",
            populate: { paxRates: { populate: ["rates"] } },
          });
          if (draft?.paxRates?.length > 0) {
            paxRates = draft.paxRates;
          } else {
            return;
          }
        } else {
          // No documentId context and no rates data — cannot compute.
          return;
        }
      }

      const { minPriceUSD, minPriceLKR } = calculateMinPrices_Tour({
        paxRates,
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

      // Check whether the incoming data.paxRates has the fully-populated rates
      // sub-component. During Strapi v5 updates from the admin panel, the
      // component data can arrive as ID-only entries (e.g. [{ id: 1, minPax: 1
      // }]) without the nested rates object. Using that incomplete data causes
      // extractLowestPriceUSD_Tour to return null and overwrites the previously
      // computed prices with null.
      //
      // This mirrors the same pattern used by the Experience lifecycle:
      //   hasFullOptionsData = data.options?.[0]?.paxRates !== undefined
      const hasFullPaxRatesData =
        data.paxRates &&
        Array.isArray(data.paxRates) &&
        data.paxRates.length > 0 &&
        data.paxRates[0].rates !== undefined;

      // Fall back to the DB-populated existing paxRates when the incoming data
      // lacks the nested rates sub-component.
      const paxRates = hasFullPaxRatesData ? data.paxRates : existing.paxRates;
      const offer = data.offer !== undefined ? data.offer : existing.offer;

      // Only recalculate if pricing fields changed OR minPrices are missing
      const pricingFieldsChanged =
        hasFullPaxRatesData || data.offer !== undefined;
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
