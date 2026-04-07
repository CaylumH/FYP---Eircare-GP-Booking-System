import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../utils/ApiRequest";

function DoctorRegister() {

    const navigate = useNavigate();

    const [closedDays, setClosedDays] = useState({
        Monday: false,
        Tuesday: false,
        Wednesday: false,
        Thursday: false,
        Friday: false,
        Saturday: false,
        Sunday: false
    });

    const [doctorSettings, setDoctorSettings] = useState(
        {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            practiceName: "",
            practiceAddress: "",
            medicalCouncilNumber: "",
            phoneNumber: "",
            streetName: "",
            city: "",
            county: "",
            country: "",
            profilePicture: null,
            providesVirtualAppointments: false,
        }
    );
    const [availability, setAvailability] = useState({

        "Monday": { openingTime: "", closingTime: "" },
        "Tuesday": { openingTime: "", closingTime: "" },
        "Wednesday": { openingTime: "", closingTime: "" },
        "Thursday": { openingTime: "", closingTime: "" },
        "Friday": { openingTime: "", closingTime: "" },
        "Saturday": { openingTime: "", closingTime: "" },
        "Sunday": { openingTime: "", closingTime: "" }
    }
    );


    const [breaks, setBreaks] = useState({
        "Monday": [{ breakStart: "", breakEnd: "" }],
        "Tuesday": [{ breakStart: "", breakEnd: "" }],
        "Wednesday": [{ breakStart: "", breakEnd: "" }],
        "Thursday": [{ breakStart: "", breakEnd: "" }],
        "Friday": [{ breakStart: "", breakEnd: "" }],
        "Saturday": [{ breakStart: "", breakEnd: "" }],
        "Sunday": [{ breakStart: "", breakEnd: "" }]
    });

    function handleAvailabilityChange(day, clopeningTime, value) {

        setAvailability((prev) => {
            const updatedDay = { ...prev[day] };

            updatedDay[clopeningTime] = value;
            return { ...prev, [day]: updatedDay };

        })
    }

    function handleBreaksChange(day, breakNumber, breakStartEnd, value) {

        setBreaks((prev) => {

            const dailyBreaks = [...prev[day]];

            const singleBreak = { ...dailyBreaks[breakNumber] };

            singleBreak[breakStartEnd] = value;
            dailyBreaks[breakNumber] = singleBreak;

            return { ...prev, [day]: dailyBreaks };
        });
    }

    function addDailyBreak(day) {

        setBreaks((prev) => ({
            ...prev, [day]: [...prev[day], { breakStart: "", breakEnd: "" }]
        }
        ));
    }

    function removeDailyBreak(day, breakNumber) {

        setBreaks((prev) => {

            const updatedDayBreaks = [...prev[day]];
            updatedDayBreaks.splice(breakNumber, 1);
            return {

                ...prev, [day]: updatedDayBreaks.length > 0 ? updatedDayBreaks : [{ breakStart: "", breakEnd: "" }]
            };
        });
    }


    function resetDailyBreaks(day) {

        setBreaks((prev) => ({
            ...prev, [day]: [{ breakStart: "", breakEnd: "" }]
        }
        ));
    }

    function isTimeValid(start, end) {
        return start && end && start < end;
    }

    async function doctorRegister(e) {
        e.preventDefault();

        const fullAddress = `${doctorSettings.streetName}, ${doctorSettings.city}, ${doctorSettings.county}, ${doctorSettings.country}`;


        try {
            const doctor = {

                user: {
                    email: doctorSettings.email,
                    password: doctorSettings.password,
                    role: "DOCTOR"
                },
                firstName: doctorSettings.firstName,
                lastName: doctorSettings.lastName,

                practiceName: doctorSettings.practiceName,
                practiceAddress: fullAddress,
                phoneNumber: doctorSettings.phoneNumber,
                medicalCouncilNumber: doctorSettings.medicalCouncilNumber,
                providesVirtualAppointments: doctorSettings.providesVirtualAppointments,
            };

            const doctorData = await apiRequest("/api/doctors/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(doctor)
            }
            );

            console.log("Doctor created", doctorData);
            const doctorId = doctorData.id;

            // Log in immediately after registration to get a token for the availability/break calls
            const loginData = await apiRequest("/api/doctors/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: doctorSettings.email, password: doctorSettings.password })
            });
            const registrationToken = loginData.token;

            for (const day in availability) {
                const availabilityForDayData = availability[day];

                if (!closedDays[day]) {

                    if (!isTimeValid(
                        availabilityForDayData.openingTime,
                        availabilityForDayData.closingTime
                    )) {
                        alert("Opening time must be before closing time");
                        return;
                    }

                    await apiRequest("/api/doctors/" + doctorId + "/availability", {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + registrationToken
                        },

                        body: JSON.stringify({
                            day: day.toUpperCase(),
                            openingTime: availabilityForDayData.openingTime,
                            closingTime: availabilityForDayData.closingTime
                        }
                        )
                    }
                    );
                }
            }

            for (const breakDay in breaks) {

                if (closedDays[breakDay]) continue;

                const breaksForDayData = breaks[breakDay];

                for (const breakPeriod of breaksForDayData) {
                    if (!breakPeriod.breakStart || !breakPeriod.breakEnd) {
                        continue;
                    }

                    if (!isTimeValid(breakPeriod.breakStart, breakPeriod.breakEnd)) {

                        alert("Break start must be before break end");
                        return;
                    }

                    const { openingTime, closingTime } = availability[breakDay];

                    if (
                        !openingTime ||
                        !closingTime) {
                        continue;
                    }


                    if (
                        breakPeriod.breakStart < openingTime ||
                        breakPeriod.breakEnd > closingTime
                    ) {
                        alert("Break must be within working hours");
                        return;
                    }

                    await apiRequest("/api/doctors/" + doctorId + "/breaks", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + registrationToken
                        },
                        body: JSON.stringify(
                            {
                                day: breakDay.toUpperCase(),
                                breakStart: breakPeriod.breakStart,
                                breakEnd: breakPeriod.breakEnd
                            }
                        )
                    });
                }
            }

            navigate("/doctor/pending");

        }
        catch (error) {
            alert("Registration Failed:" + error.message);

            console.error("Failed to register", error);
        }

    }

    return (
        <div className="d-flex justify-content-center py-5">

            <div className="card shadow-sm" style={{ width: "100%", maxWidth: "720px" }}>

                <div className="card-header text-center bg-success text-white py-3">
                    <h4 className="mb-0 fw-semibold">Doctor Registration</h4>
                </div>

                <div className="card-body p-4">

                    <form onSubmit={doctorRegister}>

                        <div className="mb-3">
                            <label className="form-label">Email:</label>
                            <input
                                type="email"
                                className="form-control"
                                required
                                value={doctorSettings.email}
                                onChange={(e) =>
                                    setDoctorSettings((prev) => ({ ...prev, email: e.target.value }))
                                }
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Password:</label>
                            <input
                                type="password"
                                className="form-control"
                                minLength="4"
                                maxLength="16"
                                required
                                value={doctorSettings.password}
                                onChange={(e) =>
                                    setDoctorSettings((prev) => ({ ...prev, password: e.target.value }))
                                }
                            />
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">First Name:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    required
                                    value={doctorSettings.firstName}
                                    onChange={(e) =>
                                        setDoctorSettings((prev) => ({ ...prev, firstName: e.target.value }))
                                    }
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Last Name:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    required
                                    value={doctorSettings.lastName}
                                    onChange={(e) =>
                                        setDoctorSettings((prev) => ({ ...prev, lastName: e.target.value }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Practice Name:</label>
                            <input
                                type="text"
                                className="form-control"
                                required
                                value={doctorSettings.practiceName}
                                onChange={(e) =>
                                    setDoctorSettings((prev) => ({ ...prev, practiceName: e.target.value }))
                                }
                            />
                        </div>

                        <div className="form-check mb-3">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                checked={doctorSettings.providesVirtualAppointments}
                                onChange={(e) =>
                                    setDoctorSettings((prev) => ({
                                        ...prev,
                                        providesVirtualAppointments: e.target.checked
                                    }))
                                }
                            />
                            <label className="form-check-label">
                                Provides virtual appointments
                            </label>
                        </div>

                        <h5 className="mt-4 mb-3">Practice Address</h5>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Street Name:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    required
                                    value={doctorSettings.streetName}
                                    onChange={(e) =>
                                        setDoctorSettings((prev) => ({ ...prev, streetName: e.target.value }))
                                    }
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">City:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    required
                                    value={doctorSettings.city}
                                    onChange={(e) =>
                                        setDoctorSettings((prev) => ({ ...prev, city: e.target.value }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">County:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    required
                                    value={doctorSettings.county}
                                    onChange={(e) =>
                                        setDoctorSettings((prev) => ({ ...prev, county: e.target.value }))
                                    }
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Country:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    required
                                    value={doctorSettings.country}
                                    onChange={(e) =>
                                        setDoctorSettings((prev) => ({ ...prev, country: e.target.value }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Medical Council Number:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    required
                                    value={doctorSettings.medicalCouncilNumber}
                                    onChange={(e) =>
                                        setDoctorSettings((prev) => ({
                                            ...prev,
                                            medicalCouncilNumber: e.target.value
                                        }))
                                    }
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Phone Number:</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    required
                                    minLength="6"
                                    maxLength="14"
                                    value={doctorSettings.phoneNumber}
                                    onChange={(e) =>
                                        setDoctorSettings((prev) => ({ ...prev, phoneNumber: e.target.value }))
                                    }
                                />
                            </div>
                        </div>

                        <h5 className="mt-4 mb-3">Availability</h5>

                        {Object.keys(availability).map((day) => (
                            <div key={day} className="mb-3 p-3 border rounded">

                                <strong>{day}</strong>

                                <div className="row mt-2">
                                    <div className="col-md-6">
                                        <label className="form-label">Opening</label>
                                        <input
                                            type="time"
                                            required={!closedDays[day]}
                                            disabled={closedDays[day]}
                                            className="form-control"
                                            value={availability[day].openingTime}
                                            onChange={(e) =>
                                                handleAvailabilityChange(day, "openingTime", e.target.value)
                                            }

                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Closing</label>
                                        <input
                                            type="time"
                                            required={!closedDays[day]}
                                            disabled={closedDays[day]}
                                            className="form-control"
                                            value={availability[day].closingTime}
                                            onChange={(e) =>
                                                handleAvailabilityChange(day, "closingTime", e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="form-check mt-2">
                                    <input
                                        type="checkbox"
                                        checked={closedDays[day]}
                                        onChange={(e) => {
                                            const isClosed = e.target.checked;

                                            setClosedDays((prev) => ({
                                                ...prev,
                                                [day]: isClosed
                                            }));

                                            if (isClosed) {
                                                handleAvailabilityChange(day, "openingTime", "");
                                                handleAvailabilityChange(day, "closingTime", "");
                                            }
                                        }}
                                    />
                                    <label className="form-check-label">Closed this day</label>
                                </div>
                            </div>
                        ))}

                        <h5 className="mt-4 mb-3">Breaks</h5>

                        {Object.keys(breaks).map((breakDay) => (
                            <div key={breakDay} className="mb-3 p-3 border rounded">

                                <strong>{breakDay}</strong>

                                {breaks[breakDay].map((breakWindow, breakIndex) => (
                                    <div key={breakIndex} className="row mt-2">

                                        <div className="col-md-5">
                                            <input
                                                type="time"
                                                
                                                disabled={closedDays[breakDay]}
                                                className="form-control"
                                                value={breakWindow.breakStart}
                                                onChange={(e) =>
                                                    handleBreaksChange(
                                                        breakDay,
                                                        breakIndex,
                                                        "breakStart",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="col-md-5">
                                            <input
                                                type="time"
                                                
                                                disabled={closedDays[breakDay]}
                                                className="form-control"
                                                value={breakWindow.breakEnd}
                                                onChange={(e) =>
                                                    handleBreaksChange(
                                                        breakDay,
                                                        breakIndex,
                                                        "breakEnd",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="col-md-2">
                                            <button
                                                type="button"
                                                className="btn btn-danger w-100"
                                                onClick={() =>
                                                    removeDailyBreak(breakDay, breakIndex)
                                                }
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    className="btn btn-outline-success mt-2"
                                    onClick={() => addDailyBreak(breakDay)}
                                >
                                    Add Break
                                </button>
                            </div>
                        ))}

                        <button type="submit" className="btn btn-success w-100 mt-4">
                            Register Doctor
                        </button>

                    </form>
                </div>
            </div>
        </div>);
}

export default DoctorRegister;
