module.exports = {
    async afterUpdate(event) {
        const { result, params } = event;
      const axios = require('axios');
      // replace with your REST API endpoint
      const url = 'https://zriadventures-dev.vercel.app/api/strapi/update-order'; 
      try {
        const response = await axios.post(url, result+"+++"+params);
        console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    //   if (params.data.paymentStatus) {
        
    //   }
    },
  };
  