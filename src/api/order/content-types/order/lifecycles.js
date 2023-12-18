const cache = {};

module.exports = {
  async beforeUpdate(event) {
    const { where } = event;

    const existingEntry = await strapi
      .query("api::order.order")
      .findOne({ id: where });
    cache[where] = existingEntry.paymentStatus;
    console.log("Existing Entry: ", existingEntry);
    console.log("PreviousPaymentStatus: ", cache[where]);
  },

  async afterUpdate(event) {
    const { params, where } = event;

    console.log("Params: ", params);
    console.log("ParamsDataPaymentStatus: ", params.data.paymentStatus);
    console.log("PreviousPaymentStatus: ", cache[where]);

    if (params.data.paymentStatus !== cache[where]) {
      const axios = require("axios");
      const url =
        "https://zriadventures-dev.vercel.app/api/strapi/update-order";

      try {
        const response = await axios.post(url, params.data);
        console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    }

    // Clear the cache for this id to free up memory
    delete cache[where];
  },
};
