const axios = require("axios");

module.exports = {
  async beforeUpdate(event) {
    const { where } = event.params;

    // Ensure `id` exists in the `where` clause
    if (!where || !where.id) {
      throw new Error("Missing 'id' in the where clause.");
    }

    const id = where.id;
    const existingEntry = await strapi.db.query("api::order.order").findOne({
      where: { id },
    });

    if (!existingEntry) {
      throw new Error(`Order with id ${id} not found.`);
    }

    // Store previousPaymentStatus in the event's state
    event.state = {
      previousPaymentStatus: existingEntry.paymentStatus,
    };
  },

  async afterUpdate(event) {
    const { result, state } = event;

    if (!state || !state.previousPaymentStatus) {
      strapi.log.error("Previous payment status not available.");
      return;
    }

    const previousPaymentStatus = state.previousPaymentStatus;

    // Check if paymentStatus has changed
    if (result.paymentStatus !== previousPaymentStatus) {
      const url = `https://zriadventures.com/api/strapi/update-order?previousPaymentStatus=${previousPaymentStatus}`;
      try {
        const response = await axios.post(url, result);
        strapi.log.info(`External API Response: ${JSON.stringify(response.data)}`);
      } catch (error) {
        strapi.log.error(`Error in afterUpdate API call: ${error.message}`);
      }
    }
  },
};
