module.exports = {
  async beforeUpdate(data, model) {
    let { id } = data;
    let existing = await strapi.query("Order").findOne({ id });

    if (existing && existing.paymentStatus != model.paymentStatus) {
      // paymentStatus has changed, so we store the new value in model
      model.newPaymentStatus = model.paymentStatus;
    }
  },
  async afterUpdate(result, params, data) {
    const axios = require("axios");
    const url = "https://zriadventures-dev.vercel.app/api/strapi/update-order";

    // Check if newPaymentStatus exists
    if (data.newPaymentStatus) {
      try {
        const response = await axios.post(url, result);
        console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    }
  },
};
