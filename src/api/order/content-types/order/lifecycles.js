module.exports = {
  async afterUpdate(event) {
    const { result } = event;
    const axios = require("axios");
    const url = "https://zriadventures-dev.vercel.app/api/strapi/update-order";

    console.log(result);

    try {
      const response = await axios.post(url, result);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  },
};
