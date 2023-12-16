import fetch from 'node-fetch'; // Make sure to install this package

module.exports = {
  models: ['paymentStatus'],

  afterUpdate: async (event) => {
    const { result, params } = event;

    if (result.paymentStatus) {
      // Your API call goes here
      // For example, using fetch:
      try {
        const response = await fetch('https://zriadventures-dev.vercel.app/api/strapi/update-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
      } catch (error) {
        console.error('There was an error!', error);
      }
    }
  },
};
