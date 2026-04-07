export const getSlotType = (singleSlot, appointment) => {
    if (appointment) {
        if (appointment.appointmentStatus === "UNAVAILABLE") {
            return 'unavailable';
        }
        return 'appointment';
    }
    if (singleSlot.booked) {
        return 'break';
    }
    return 'available';
};

