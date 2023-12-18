module.exports = {
  async beforeUpdate(event) {
    const { where } = event;

    const existingEntry = await strapi
      .query("api::order.order")
      .findOne({ id: where });
    event.previousPaymentStatus = existingEntry.paymentStatus;
    console.log("Existing Entry: ", existingEntry);
    console.log("PreviousPaymentStatus: ", event.previousPaymentStatus);
  },

  async afterUpdate(event) {
    const { params } = event;

    console.log("Params: ", params);
    console.log("ParamsDataPaymentStatus: ", params.data.paymentStatus);
    console.log("PreviousPaymentStatus: ", event.previousPaymentStatus);

    if (params.data.paymentStatus !== event.previousPaymentStatus) {
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
  },
};
