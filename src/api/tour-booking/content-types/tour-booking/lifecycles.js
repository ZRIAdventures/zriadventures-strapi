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
      const departure = await strapi.documents("api::group-tour-departure.group-tour-departure").findOne({
        documentId: data.departure
      });

      if (!departure) {
        throw new Error(`Group tour departure ${data.departure} not found`);
      }

      // Validate capacity
      const currentBooked = departure.bookedCount || 0;
      const requestedPax = data.totalPax || 0;
      const availableSeats = departure.maxCapacity - currentBooked;

      if (requestedPax > availableSeats) {
        throw new Error(
          `Insufficient capacity. Requested: ${requestedPax} seats, Available: ${availableSeats} seats`
        );
      }

      // Check if departure is open
      if (departure.groupStatus !== "open") {
        throw new Error(`This departure is ${departure.groupStatus} and no longer accepting bookings`);
      }
    } catch (error) {
      console.error("[tour-booking beforeCreate] Validation error:", error.message);
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
      const departure = await strapi.documents("api::group-tour-departure.group-tour-departure").findOne({
        documentId: result.departure.documentId
      });

      if (!departure) {
        console.error(`[tour-booking afterCreate] Departure ${result.departure.documentId} not found`);
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

      // Update the departure
      await strapi.documents("api::group-tour-departure.group-tour-departure").update({
        documentId: result.departure.documentId,
        data: {
          bookedCount: newBooked,
          groupStatus: newStatus,
        },
      });

      console.log(
        `[tour-booking afterCreate] Updated departure ${result.departure.documentId}: ` +
        `bookedCount: ${currentBooked} → ${newBooked}, status: ${departure.groupStatus} → ${newStatus}`
      );
    } catch (error) {
      console.error("[tour-booking afterCreate] Error updating departure:", error.message);
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
      const departure = await strapi.documents("api::group-tour-departure.group-tour-departure").findOne({
        documentId: result.departure.documentId
      });

      if (!departure) {
        console.error(`[tour-booking afterDelete] Departure ${result.departure.documentId} not found`);
        return;
      }

      // Calculate new booked count
      const currentBooked = departure.bookedCount || 0;
      const newBooked = Math.max(0, currentBooked - (result.totalPax || 0));

      // Determine new status
      let newStatus = departure.groupStatus;
      if (newBooked < departure.maxCapacity && departure.groupStatus === "full") {
        newStatus = "open";
      }

      // Update the departure
      await strapi.documents("api::group-tour-departure.group-tour-departure").update({
        documentId: result.departure.documentId,
        data: {
          bookedCount: newBooked,
          groupStatus: newStatus,
        },
      });

      console.log(
        `[tour-booking afterDelete] Updated departure ${result.departure.documentId}: ` +
        `bookedCount: ${currentBooked} → ${newBooked}, status: ${departure.groupStatus} → ${newStatus}`
      );
    } catch (error) {
      console.error("[tour-booking afterDelete] Error updating departure:", error.message);
      // Don't throw - booking is already deleted, log the error for manual intervention
    }
  },
};
