const axios = require("axios");

module.exports = {
  async beforeUpdate(event) {
    const { where } = event.params;

    // Ensure `id` exists in the `where` clause
    if (!where || !where.id) {
      throw new Error("Missing 'id' in the where clause.");
    }

    const id = where.id;
    const existingEntry = await strapi.entityService.findOne(
      "api::voucher.voucher",
      id
    );

    if (!existingEntry) {
      throw new Error(`Voucher with id ${id} not found.`);
    }

    // Store previousPaymentStatus in the event's state
    event.state = {
      previousStatus: existingEntry.status,
    };
  },

  async afterUpdate(event) {
    const { result, state } = event;

    if (!state || !state.previousStatus) {
      console.error("Previous status not available.");
      return;
    }

    const previousStatus = state.previousStatus;

    // Check if paymentStatus has changed
    if (result.status !== previousStatus) {
      const url = `https://zriadventures.com/api/strapi/update-voucher?previousStatus=${previousStatus}`;
      try {
        const response = await axios.post(url, result);
        console.log("External API Response:", response.data);
      } catch (error) {
        console.error("Error in afterUpdate API call:", error.message);
      }
    }
  },
};
