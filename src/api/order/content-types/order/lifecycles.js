const fetch = require('node-fetch'); // Make sure to install this package

module.exports = {
  models: ['paymentStatus'],

  afterUpdate(event) {
    const { result, params } = event;

    if (result.paymentStatus) {
      // Your API call goes here
      // For example, using fetch:
      fetch('https://zriadventures-dev.vercel.app/api/strapi/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log(data);
      })
      .catch(error => {
        console.error('There was an error!', error);
      });
    }
  },
};
