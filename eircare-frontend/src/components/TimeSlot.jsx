import { getSlotType } from "../utils/slotUtils";

function TimeSlot({
    singleSlot,
    day,
    appointment,
    setSelectedAppointment,
    cancelAppointment,
    isAppointmentCancelled,
    setSelectTimeSlot
}

) {

    const slotType = getSlotType(singleSlot, appointment);

    const isUnavailable = slotType === "unavailable";

    switch (slotType) {

        case "appointment":
            return (
                <div
                    className={`rounded-2 p-2 border ${
                        isUnavailable

                            ? "bg-light border-secondary"
                            : "bg-success-subtle border-success-subtle"
                    }`}
                    style={{ 
                        cursor: isUnavailable ? "default" : "pointer" 
                    }}
                    onClick={() => { if (!isUnavailable) setSelectedAppointment(appointment); }}
                >

                    <div className="fw-semibold small">
                        {singleSlot.time}
                        </div>

                    <div className="small text-truncate">

                        {isUnavailable ? (
                        <span className="text-muted">
                            Unavailable
                        </span>
                    ) : (
                        appointment.patient
                            ? appointment.patient.firstName + " " + appointment.patient.lastName
                            : "Unknown Patient"
                    )}
                    
                    </div>

                    {!isUnavailable && (
                        <div className="small text-muted text-truncate">
                            {appointment.appointmentType}
                        </div>
                    )}

                    <button
                        className="btn btn-outline-danger btn-sm mt-1 w-100"
                        onClick={(e) => {
                            e.stopPropagation();
                            cancelAppointment(appointment.appointmentId);
                        }}
                        disabled={
                            !isUnavailable &&
                             (
                                isAppointmentCancelled(appointment) ||
                                appointment.appointmentStatus === "COMPLETED"
                            )
                        }
                    >
                        {isUnavailable ? "Remove" : "Cancel"}
                    </button>
                </div>
            );

        case "break":
            return (
                <div className="rounded-2 p-2 text-center bg-light border small text-muted">
                    
                    <div>
                        {singleSlot.time}
                        </div>
                    
                    <div>
                        Break
                        </div>
                </div>
            );

        case "available":
            return (
                <button
                    className="btn btn-outline-success w-100 btn-sm"
                    onClick={() =>
                        setSelectTimeSlot({
                            date: day.date,
                            time: singleSlot.time
                        }
                    )
                    }
                >
                    {singleSlot.time}
                </button>
            );

        default:
            return null;
    }
}

export default TimeSlot;
