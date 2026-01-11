/**
 * Tour Booking Lifecycle Hooks
 *
 * Handles group tour capacity management:
 * - Updates GroupTourDeparture.bookedCount when bookings are created
 * - Prevents overbooking by validating capacity
 * - Auto-updates groupStatus to 'full' when capacity is reached
 */

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;

    // Only process group tour bookings
    if (data.tourType !== "group" || !data.departure) {
      return;
    }

    try {
      // Fetch the departure to check capacity
      // Handle both numeric id and documentId string
      let departure;
      if (typeof data.departure === "number") {
        // Legacy numeric id - convert to documentId by fetching via entity service
        const entity = await strapi.db.query("api::group-tour-departure.group-tour-departure").findOne({
          where: { id: data.departure },
        });
        if (entity && entity.documentId) {
          departure = await strapi
            .documents("api::group-tour-departure.group-tour-departure")
            .findOne({
              documentId: entity.documentId,
            });
        }
      } else {
        // documentId string
        departure = await strapi
          .documents("api::group-tour-departure.group-tour-departure")
          .findOne({
            documentId: data.departure,
          });
      }

      if (!departure) {
        throw new Error(`Group tour departure ${data.departure} not found`);
      }

      // Validate capacity
      const currentBooked = departure.bookedCount || 0;
      const requestedPax = data.totalPax || 0;
      const availableSeats = departure.maxCapacity - currentBooked;

      if (requestedPax > availableSeats) {
        throw new Error(
          `Insufficient capacity. Requested: ${requestedPax} seats, Available: ${availableSeats} seats`,
        );
      }

      // Check if departure is open
      if (departure.groupStatus !== "open") {
        throw new Error(
          `This departure is ${departure.groupStatus} and no longer accepting bookings`,
        );
      }
    } catch (error) {
      console.error(
        "[tour-booking beforeCreate] Validation error:",
        error.message,
      );
      throw error;
    }
  },

  async afterCreate(event) {
    const { result } = event;

    // Only process group tour bookings
    if (result.tourType !== "group" || !result.departure) {
      return;
    }

    try {
      // Fetch the current departure
      // Handle both populated relation (object with documentId) and raw ID
      let departureIdentifier;
      if (typeof result.departure === "object" && result.departure.documentId) {
        departureIdentifier = result.departure.documentId;
      } else if (typeof result.departure === "number") {
        departureIdentifier = result.departure;
      } else if (typeof result.departure === "string") {
        departureIdentifier = result.departure;
      } else {
        console.error(
          "[tour-booking afterCreate] Invalid departure reference:",
          result.departure,
        );
        return;
      }

      let departure;
      if (typeof departureIdentifier === "number") {
        // Convert numeric id to documentId via entity service
        const entity = await strapi.db.query("api::group-tour-departure.group-tour-departure").findOne({
          where: { id: departureIdentifier },
        });
        if (entity && entity.documentId) {
          departure = await strapi
            .documents("api::group-tour-departure.group-tour-departure")
            .findOne({
              documentId: entity.documentId,
            });
        }
      } else {
        departure = await strapi
          .documents("api::group-tour-departure.group-tour-departure")
          .findOne({
            documentId: departureIdentifier,
          });
      }

      if (!departure) {
        console.error(
          `[tour-booking afterCreate] Departure ${departureIdentifier} not found`,
        );
        return;
      }

      // Calculate new booked count
      const currentBooked = departure.bookedCount || 0;
      const newBooked = currentBooked + (result.totalPax || 0);

      // Determine new status
      let newStatus = departure.groupStatus;
      if (newBooked >= departure.maxCapacity) {
        newStatus = "full";
      }

      // Update the departure using its documentId
      await strapi
        .documents("api::group-tour-departure.group-tour-departure")
        .update({
          documentId: departure.documentId,
          data: {
            bookedCount: newBooked,
            groupStatus: newStatus,
          },
        });

      console.log(
        `[tour-booking afterCreate] Updated departure ${departure.documentId}: ` +
          `bookedCount: ${currentBooked} → ${newBooked}, status: ${departure.groupStatus} → ${newStatus}`,
      );
    } catch (error) {
      console.error(
        "[tour-booking afterCreate] Error updating departure:",
        error.message,
      );
      // Don't throw - booking is already created, log the error for manual intervention
    }
  },

  async afterDelete(event) {
    const { result } = event;

    // Only process group tour bookings
    if (result.tourType !== "group" || !result.departure) {
      return;
    }

    try {
      // Fetch the current departure
      // Handle both populated relation (object with documentId) and raw ID
      let departureIdentifier;
      if (typeof result.departure === "object" && result.departure.documentId) {
        departureIdentifier = result.departure.documentId;
      } else if (typeof result.departure === "number") {
        departureIdentifier = result.departure;
      } else if (typeof result.departure === "string") {
        departureIdentifier = result.departure;
      } else {
        console.error(
          "[tour-booking afterDelete] Invalid departure reference:",
          result.departure,
        );
        return;
      }

      let departure;
      if (typeof departureIdentifier === "number") {
        // Convert numeric id to documentId via entity service
        const entity = await strapi.db.query("api::group-tour-departure.group-tour-departure").findOne({
          where: { id: departureIdentifier },
        });
        if (entity && entity.documentId) {
          departure = await strapi
            .documents("api::group-tour-departure.group-tour-departure")
            .findOne({
              documentId: entity.documentId,
            });
        }
      } else {
        departure = await strapi
          .documents("api::group-tour-departure.group-tour-departure")
          .findOne({
            documentId: departureIdentifier,
          });
      }

      if (!departure) {
        console.error(
          `[tour-booking afterDelete] Departure ${departureIdentifier} not found`,
        );
        return;
      }

      // Calculate new booked count
      const currentBooked = departure.bookedCount || 0;
      const newBooked = Math.max(0, currentBooked - (result.totalPax || 0));

      // Determine new status
      let newStatus = departure.groupStatus;
      if (
        newBooked < departure.maxCapacity &&
        departure.groupStatus === "full"
      ) {
        newStatus = "open";
      }

      // Update the departure using its documentId
      await strapi
        .documents("api::group-tour-departure.group-tour-departure")
        .update({
          documentId: departure.documentId,
          data: {
            bookedCount: newBooked,
            groupStatus: newStatus,
          },
        });

      console.log(
        `[tour-booking afterDelete] Updated departure ${result.departure.documentId}: ` +
          `bookedCount: ${currentBooked} → ${newBooked}, status: ${departure.groupStatus} → ${newStatus}`,
      );
    } catch (error) {
      console.error(
        "[tour-booking afterDelete] Error updating departure:",
        error.message,
      );
      // Don't throw - booking is already deleted, log the error for manual intervention
    }
  },
};
