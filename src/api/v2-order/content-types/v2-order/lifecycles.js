module.exports = {
  async beforeUpdate(event) {
    const { where, data } = event.params;

    // Get documentId from where clause (REST API) or try to extract from context
    let documentId = where?.documentId;

    // If documentId not in where clause, it might be in the event's params.data.documentId (for direct calls)
    // Or we can try to infer it from the query
    if (!documentId && where?.id) {
      documentId = where.id;
    }

    // If still no documentId, log warning but don't fail - allow the update to proceed
    if (!documentId) {
      console.warn(
        "[v2-order beforeUpdate] Could not determine documentId from where clause:",
        JSON.stringify(where),
      );
      // Don't throw error - just proceed with the update
      // The lifecycle will work with whatever Strapi provides
      event.state = {
        previousPaymentStatus: null,
      };
      return;
    }

    try {
      const existingEntry = await strapi
        .documents("api::v2-order.v2-order")
        .findOne({
          documentId: documentId,
        });

      if (!existingEntry) {
        console.warn(
          `[v2-order beforeUpdate] Order with documentId ${documentId} not found.`,
        );
        event.state = {
          previousPaymentStatus: null,
        };
        return;
      }

      // Store previousPaymentStatus in the event's state
      event.state = {
        previousPaymentStatus: existingEntry.paymentStatus,
      };
    } catch (error) {
      console.error(
        `[v2-order beforeUpdate] Error fetching existing entry:`,
        error.message,
      );
      // Don't throw - allow update to continue
      event.state = {
        previousPaymentStatus: null,
      };
    }
  },

  async afterUpdate(event) {
    const { result, state } = event;

    if (!state || !state.previousPaymentStatus) {
      console.log(
        "[v2-order afterUpdate] Skipping notification - no previous payment status available or no change.",
      );
      return;
    }

    const previousPaymentStatus = state.previousPaymentStatus;

    // Check if paymentStatus has changed
    if (result.paymentStatus !== previousPaymentStatus) {
      console.log(
        `[v2-order afterUpdate] Payment status changed: ${previousPaymentStatus} → ${result.paymentStatus} ` +
          `for order ${result.orderId}`,
      );

      const url = `https://zriadventures.com/api/strapi/update-order?previousPaymentStatus=${previousPaymentStatus}`;

      try {
        const response = await axios.post(url, result);
        console.log(
          `[v2-order afterUpdate] External API Response:`,
          response.data,
        );

        // Update receiptSent flag if payment succeeded
        if (result.paymentStatus === "SUCCESS" && !result.receiptSent) {
          await strapi.documents("api::v2-order.v2-order").update({
            documentId: result.documentId,
            data: {
              receiptSent: true,
            },
          });
          console.log(
            `[v2-order afterUpdate] Receipt sent flag updated for order ${result.orderId}`,
          );
        }
      } catch (error) {
        console.error(
          `[v2-order afterUpdate] Error calling external API:`,
          error.message,
        );
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
