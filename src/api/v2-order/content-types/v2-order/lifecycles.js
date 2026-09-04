module.exports = {
  async beforeUpdate(event) {
    const { where, data } = event.params;

    // Get documentId from where clause (REST API) or try to extract from context
    let documentId = where?.documentId;

    // A numeric row id is deliberately NOT used as a documentId fallback here:
    // documents().findOne({ documentId }) can never match one, so it looked
    // up nothing, logged no warning, and quietly dropped the previous payment
    // status - suppressing the status-change notification below.
    if (!documentId && where?.id) {
      const row = await strapi.db.query("api::v2-order.v2-order").findOne({
        where: { id: where.id },
        select: ["documentId"],
      });
      documentId = row?.documentId;
    }

    // If still no documentId, log warning but don't fail - allow the update to proceed
    if (!documentId) {
      strapi.log.warn(
        `[v2-order beforeUpdate] Could not determine documentId from where clause: ${JSON.stringify(where)}`,
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
        strapi.log.warn(
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
      strapi.log.error(
        `[v2-order beforeUpdate] Error fetching existing entry: ${error.message}`,
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
      strapi.log.info(
        "[v2-order afterUpdate] Skipping notification - no previous payment status available or no change.",
      );
      return;
    }

    const previousPaymentStatus = state.previousPaymentStatus;

    // Check if paymentStatus has changed
    if (result.paymentStatus !== previousPaymentStatus) {
      strapi.log.info(
        `[v2-order afterUpdate] Payment status changed: ${previousPaymentStatus} → ${result.paymentStatus} ` +
          `for order ${result.orderId}`,
      );

      const baseUrl = process.env.APP_BASE_URL;
      const internalSecret = process.env.INTERNAL_API_SECRET;

      if (!baseUrl) {
        strapi.log.warn(
          "[v2-order afterUpdate] APP_BASE_URL is not set; skipping external sync."
        );
        return;
      }

      const url = `${baseUrl}/api/strapi/update-order?previousPaymentStatus=${previousPaymentStatus}`;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(internalSecret
              ? { Authorization: `Bearer ${internalSecret}` }
              : {}),
          },
          body: JSON.stringify(result),
        });
        const responseBody = await response.json().catch(() => ({}));
        strapi.log.info(
          `[v2-order afterUpdate] External API Response: ${JSON.stringify(responseBody)}`,
        );
      } catch (error) {
        strapi.log.error(
          `[v2-order afterUpdate] Error calling external API: ${error.message}`,
        );
        // Don't throw - order is already updated, log for manual intervention
      }
    }
  },

  async afterCreate(event) {
    strapi.log.info(
      `[v2-order afterCreate] New order created: ${event.result.orderId}`,
    );
  },
};
