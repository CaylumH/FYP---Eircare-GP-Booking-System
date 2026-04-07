import TimeSlot from "../TimeSlot";

function DoctorAppointmentScheduleLayout({
    weekTimeSlots,
    getAppointmentForTimeSlot,
    setSelectedAppointment,
    openVirtualAppointmentModal,
    cancelAppointment,
    isAppointmentCancelled,
    setSelectTimeSlot
}) {
    return (
        <div className="card shadow-sm rounded-3 p-3 w-100" 
        style={{ maxWidth: "1000px" }}>

            <div style={{ overflowX: "auto" }}>

                <div 
                className="row flex-nowrap g-2" 
                style={{ minWidth: "560px" }}> //should be scrollable

                    {weekTimeSlots.map((day) => {

                        const date = new Date(day.date);

                        const dayName = date.toLocaleDateString('en-IE', { weekday: 'short' });
                        const dayNum = date.getDate();
                        const month = date.toLocaleDateString('en-IE', { month: 'short' });

                        return (
                            <div className="col" key={day.date}>

                                <div
                                    className="text-center bg-success text-white rounded-2 py-2 mb-2 fw-semibold lh-sm"
                                    style={{ fontSize: "0.78rem" }}
                                >
                                    <div>{dayName}</div>
                                    <div>{dayNum} {month}</div>
                                </div>

                                {day.slots.length === 0 ? ( //no time slots from backend means day off
                                //Day off be one dive instead of multipe - looks way cleaner
                                    <div className="text-center text-muted py-3 border border-success-subtle rounded-2 small">
                                        Day Off
                                    </div>
                                ) : (
                                    day.slots.map((singleSlot) => {

                                        const appointment = getAppointmentForTimeSlot(day.date, singleSlot.time);

                                        const isStart = !!singleSlot.isAppointmentStartSlot;
                                        const isLonf = singleSlot.numberOfSlots === 2;

                                        return (
                                            <div className="mb-1" key={singleSlot.time}>

                                                <TimeSlot
                                                    singleSlot={singleSlot}
                                                    day={day}
                                                    appointment={appointment}
                                                    isAppointmentStartSlot={isStart}
                                                    isLongAppointment={isLonf}
                                                    setSelectedAppointment={setSelectedAppointment}
                                                    openVirtualAppointmentModal={openVirtualAppointmentModal}
                                                    cancelAppointment={cancelAppointment}
                                                    isAppointmentCancelled={isAppointmentCancelled}
                                                    setSelectTimeSlot={setSelectTimeSlot}
                                                />
                                            </div>
                                        );
                                    }
                                )
                                )}
                            </div>
                        );
                    })}
                
                </div>
            </div>
        
        </div>
    );
}
export default DoctorAppointmentScheduleLayout;
