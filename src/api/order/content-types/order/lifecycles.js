let previousPaymentStatus;

module.exports = {
  beforeUpdate(event) {
    const { params } = event;
    previousPaymentStatus = params.data.paymentStatus;
  },

  async afterUpdate(event) {
    const { params } = event;

    if (params.data.paymentStatus !== previousPaymentStatus) {
      const axios = require("axios");
      const url =
        "https://zriadventures-dev.vercel.app/api/strapi/update-order";

      try {
        const response = await axios.post(url, result);
        console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    }
  },
};
