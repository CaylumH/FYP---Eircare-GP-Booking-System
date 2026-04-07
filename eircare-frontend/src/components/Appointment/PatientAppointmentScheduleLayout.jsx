function PatientAppointmentScheduleLayout({ weekTimeSlots, setSelectTimeSlot }) {

    return (
        <div 
        className="card shadow-sm rounded-3 p-3 w-100" 
        style={{ maxWidth: "1000px" }}
        >

            <div style={{ overflowX: "auto" }}>

                <div className="row flex-nowrap g-2" 
                style={{ minWidth: "560px" }}
                >

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

                                {day.slots.length === 0 ? (
                                    <div className="text-center text-muted py-3 border border-success-subtle rounded-2 small">
                                        Day Off
                                    </div>
                                ) : (
                                    day.slots.map((slot) => (

                                        <div className="mb-1" key={slot.time}>

                                            <button
                                                className={`btn w-100 btn-sm ${slot.booked
                                                     ? "btn-outline-secondary"
                                                     : "btn-success"}`}
                                                disabled={slot.booked}
                                                onClick={() => setSelectTimeSlot({ date: day.date, time: slot.time })}
                                            >
                                                {slot.time}
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
}
export default PatientAppointmentScheduleLayout;
