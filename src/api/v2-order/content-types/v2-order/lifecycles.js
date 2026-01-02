/**
 * V2 Order Lifecycle Hooks
 *
 * Migrated from legacy order system with enhancements:
 * - Payment status change notifications
 * - Receipt email triggers
 * - Integration with external notification API
 */

const axios = require("axios");

module.exports = {
  async beforeUpdate(event) {
    const { where } = event.params;

    // Ensure documentId exists in the where clause
    if (!where || !where.documentId) {
      throw new Error("Missing 'documentId' in the where clause.");
    }

    const documentId = where.documentId;
    const existingEntry = await strapi.documents("api::v2-order.v2-order").findOne({
      documentId: documentId,
    });

    if (!existingEntry) {
      throw new Error(`V2 Order with documentId ${documentId} not found.`);
    }

    // Store previousPaymentStatus in the event's state
    event.state = {
      previousPaymentStatus: existingEntry.paymentStatus,
    };
  },

  async afterUpdate(event) {
    const { result, state } = event;

    if (!state || !state.previousPaymentStatus) {
      console.error("[v2-order afterUpdate] Previous payment status not available.");
      return;
    }

    const previousPaymentStatus = state.previousPaymentStatus;

    // Check if paymentStatus has changed
    if (result.paymentStatus !== previousPaymentStatus) {
      console.log(
        `[v2-order afterUpdate] Payment status changed: ${previousPaymentStatus} → ${result.paymentStatus} ` +
        `for order ${result.orderId}`
      );

      const url = `https://zriadventures.com/api/strapi/update-order?previousPaymentStatus=${previousPaymentStatus}`;

      try {
        const response = await axios.post(url, result);
        console.log(`[v2-order afterUpdate] External API Response:`, response.data);

        // Update receiptSent flag if payment succeeded
        if (result.paymentStatus === "SUCCESS" && !result.receiptSent) {
          await strapi.documents("api::v2-order.v2-order").update({
            documentId: result.documentId,
            data: {
              receiptSent: true,
            },
          });
          console.log(`[v2-order afterUpdate] Receipt sent flag updated for order ${result.orderId}`);
        }
      } catch (error) {
        console.error(`[v2-order afterUpdate] Error calling external API:`, error.message);
        // Don't throw - order is already updated, log for manual intervention
      }
    }
  },

  async afterCreate(event) {
    const { result } = event;

    console.log(`[v2-order afterCreate] New order created: ${result.orderId}`);

    // Trigger notification for new order (optional - external API handles this)
    // Could add additional logic here for order confirmation emails
  },
};
