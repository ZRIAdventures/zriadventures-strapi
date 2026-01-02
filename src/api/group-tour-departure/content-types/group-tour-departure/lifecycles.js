/**
 * Group Tour Departure Lifecycle Hooks
 *
 * Additional validation and automation for departure management
 */

module.exports = {
  async beforeUpdate(event) {
    const { data } = event.params;

    // Validate: bookedCount cannot exceed maxCapacity
    if (data.bookedCount !== undefined && data.maxCapacity !== undefined) {
      if (data.bookedCount > data.maxCapacity) {
        throw new Error(
          `Booked count (${data.bookedCount}) cannot exceed max capacity (${data.maxCapacity})`
        );
      }
    }

    // If bookedCount is being manually updated, auto-update status
    if (data.bookedCount !== undefined) {
      const { where } = event.params;

      // Get current departure to check maxCapacity
      const currentDeparture = await strapi.documents("api::group-tour-departure.group-tour-departure").findOne({
        documentId: where.documentId
      });

      if (currentDeparture) {
        const maxCapacity = data.maxCapacity !== undefined ? data.maxCapacity : currentDeparture.maxCapacity;

        // Auto-update groupStatus based on bookedCount
        if (data.bookedCount >= maxCapacity) {
          data.groupStatus = "full";
        } else if (data.bookedCount < maxCapacity && currentDeparture.groupStatus === "full") {
          data.groupStatus = "open";
        }
      }
    }
  },

  async beforeCreate(event) {
    const { data } = event.params;

    // Default bookedCount to 0 if not provided
    if (data.bookedCount === undefined || data.bookedCount === null) {
      data.bookedCount = 0;
    }

    // Default groupStatus to 'open' if not provided
    if (!data.groupStatus) {
      data.groupStatus = "open";
    }

    // Validate maxCapacity is set
    if (!data.maxCapacity || data.maxCapacity < 1) {
      throw new Error("Max capacity must be at least 1");
    }
  },
};
