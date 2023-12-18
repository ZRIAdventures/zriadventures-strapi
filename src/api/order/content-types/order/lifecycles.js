let previousPaymentStatus;

module.exports = {
  beforeUpdate(event) {
    const { result } = event;
    previousPaymentStatus = result.paymentStatus;
  },

  async afterUpdate(event) {
    const { result } = event;

    if (result.paymentStatus !== previousPaymentStatus) {
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
