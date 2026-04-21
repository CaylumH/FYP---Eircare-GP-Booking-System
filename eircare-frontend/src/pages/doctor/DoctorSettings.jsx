import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getToken, logout } from "../../services/authService";
import { apiRequest } from "../../utils/ApiRequest";
import { useFetchUserDetails } from "../../hooks/useFetchUserDetails";

function DoctorSettings() {
    const { id: doctorId } = useParams();
    const navigate = useNavigate();

    const { userDetails } = useFetchUserDetails(doctorId, "DOCTOR");
    const [doctorSettings, setDoctorSettings] = useState({
        firstName: "",
        lastName: "",
        email: "",
        medicalCouncilNumber: "",
        profilePicture: null,
        providesVirtualAppointments: false,
    });

    const [closedDays, setClosedDays] = useState({
        Monday: false,
        Tuesday: false,
        Wednesday: false,
        Thursday: false,
        Friday: false,
        Saturday: false,
        Sunday: false
    });

    const [availability, setAvailability] = useState({
        "Monday": { openingTime: "", closingTime: "" },
        "Tuesday": { openingTime: "", closingTime: "" },
        "Wednesday": { openingTime: "", closingTime: "" },
        "Thursday": { openingTime: "", closingTime: "" },
        "Friday": { openingTime: "", closingTime: "" },
        "Saturday": { openingTime: "", closingTime: "" },
        "Sunday": { openingTime: "", closingTime: "" }
    });

    const [breaks, setBreaks] = useState({
        "Monday": [{ breakStart: "", breakEnd: "" }],
        "Tuesday": [{ breakStart: "", breakEnd: "" }],
        "Wednesday": [{ breakStart: "", breakEnd: "" }],
        "Thursday": [{ breakStart: "", breakEnd: "" }],
        "Friday": [{ breakStart: "", breakEnd: "" }],
        "Saturday": [{ breakStart: "", breakEnd: "" }],
        "Sunday": [{ breakStart: "", breakEnd: "" }]
    });

//populate form from fetched details
    useEffect(() => {
        if (userDetails) {
            setDoctorSettings((prev) => ({
                ...prev,
                firstName: userDetails.firstName ?? "",
                lastName: userDetails.lastName ?? "",
                email: userDetails.user?.email ?? "",
                medicalCouncilNumber: userDetails.medicalCouncilNumber ?? "",
                providesVirtualAppointments: userDetails.providesVirtualAppointments ?? false,
            }
        ));
        }
    }, [userDetails]);

    useEffect(() => {

        if (!doctorId) return;
        apiRequest(`/api/doctors/${doctorId}/availability/all`, {
            headers: { "Authorization": `Bearer ${getToken()}` }
        }).then((data) => {
            if (!data || data.length === 0) return;
            setAvailability((prev) => {
                const updated = { ...prev };

                data.forEach((slot) => {
                    const day = slot.day.charAt(0) + slot.day.slice(1).toLowerCase();

                    if (updated[day] !== undefined) {
                        updated[day] = { openingTime: slot.openingTime ?? "", closingTime: slot.closingTime ?? "" };
                    }
                }
            
            );
                return updated;
            }
        );

            setClosedDays((prev) => {

                const updated = { ...prev };
                const activeDays = new Set(data.map((slot) => slot.day.charAt(0) + slot.day.slice(1).toLowerCase()
            )
        );
                Object.keys(updated).forEach((day) => {
                    updated[day] = !activeDays.has(day);
                }
            );
                return updated;
            });
        }
    ).catch(() => {});
    }, [doctorId]);

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
        }
    
    );
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
        }
    );
    }

    function isTimeValid(start, end) {

        return start && end && start < end;
    }

    function handleProfilePictureChange(e) {

        const pfp = e.target.files[0];
        setDoctorSettings((prev) => ({
            ...prev, profilePicture: pfp
        }));
    }

    async function uploadProfilePicture() {

        if (!doctorSettings.profilePicture) {
            alert("Please upload an image first");
            return;
        }

        const formData = new FormData();
        formData.append("profilePicture", doctorSettings.profilePicture);

        try {
            await apiRequest(`/api/doctors/uploadProfilePicture?doctorId=${doctorId}`, {
                method: "POST",
                headers: {
                     "Authorization": `Bearer ${getToken()}` },
                body: formData
            });

            alert("Profile picture updated!");
        } catch (error) {
            console.error("Error uploading pfp", error);
            alert("Error uploading pfp");
        }
    }

    async function handleUpdateDetails(e) {
        e.preventDefault();

        try {
            await apiRequest(`/api/doctors/${doctorId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                    user: { email: doctorSettings.email },
                    firstName: doctorSettings.firstName,
                    lastName: doctorSettings.lastName,
                    medicalCouncilNumber: doctorSettings.medicalCouncilNumber,
                    providesVirtualAppointments: doctorSettings.providesVirtualAppointments
                })
            }
        );

            if (doctorSettings.email !== userDetails?.user?.email) {

                alert("Email updated. Please log in again.");

                logout(navigate);

                
                return;
            }
            alert("Details updated successfully");
        } catch (error) {
            console.error("couldn't update details", error);
            alert("Failed to update details");
        }
    }

    async function handleSaveAvailability(e) {
        e.preventDefault();

        try {
            await apiRequest(`/api/doctors/${doctorId}/availability`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${getToken()}` }
            });

            await apiRequest(`/api/doctors/${doctorId}/breaks`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${getToken()}` }
            });

            for (const day in availability) {
                const availabilityForDayData = availability[day];

                if (!closedDays[day]) {

                    if (!isTimeValid(
                        availabilityForDayData.openingTime,
                        availabilityForDayData.closingTime
                    )) {
                        alert(`${day}: Opening time must be before closing time`);
                        return;
                    }

                    await apiRequest("/api/doctors/" + doctorId + "/availability", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${getToken()}`
                        },
                        body: JSON.stringify({
                            day: day.toUpperCase(),
                            openingTime: availabilityForDayData.openingTime,
                            closingTime: availabilityForDayData.closingTime
                        })
                    });
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
                        alert(`${breakDay}: Break start must be before break end`);
                        return;
                    }

                    const { openingTime, closingTime } = availability[breakDay];

                    if (!openingTime || !closingTime) {
                        continue;
                    }

                    if (
                        breakPeriod.breakStart < openingTime ||
                        breakPeriod.breakEnd > closingTime
                    ) {
                        alert(`${breakDay}: Break must be within working hours`);
                        return;
                    }

                    await apiRequest("/api/doctors/" + doctorId + "/breaks", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${getToken()}`
                        },
                        body: JSON.stringify({
                            day: breakDay.toUpperCase(),
                            breakStart: breakPeriod.breakStart,
                            breakEnd: breakPeriod.breakEnd
                        })
                    });
                }
            }

            alert("Availability saved successfully");
        } catch (error) {
            console.error("couldn't save availability", error);
            alert("Failed to save availability");
        }
    }

    return (
        <div className="d-flex justify-content-center py-5">

            <div className="card shadow-sm" style={{ width: "100%", maxWidth: "580px" }}>

                <div className="card-header text-center bg-success text-white py-3">

                    <h4 className="mb-0 fw-semibold">Doctor Settings</h4>
                </div>

                <div className="card-body p-4">

                    <form onSubmit={handleUpdateDetails}>

                        <div className="mb-3">

                            <label className="form-label">Profile Picture</label>

                            <div className="d-flex gap-2 align-items-center">
                                <input
                                    onChange={handleProfilePictureChange}
                                    className="form-control"
                                    type="file"
                                    accept="image/*"
                                />
                                <button
                                    type="button"
                                    onClick={uploadProfilePicture}
                                    className="btn btn-outline-success flex-shrink-0"
                                >
                                    Upload
                                </button>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input
                                value={doctorSettings.email}
                                onChange={(e) =>
                                    setDoctorSettings((prev) => ({ ...prev, email: e.target.value })
                                )}
                                type="email"
                                className="form-control"
                            />
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">First Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={doctorSettings.firstName}
                                    onChange={(e) =>
                                        setDoctorSettings((prev) => ({ ...prev, firstName: e.target.value }))}
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Last Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={doctorSettings.lastName}
                                    onChange={(e) =>
                                        setDoctorSettings((prev) => ({ ...prev, lastName: e.target.value }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Medical Council Number</label>
                            <input
                                type="text"
                                className="form-control"
                                value={doctorSettings.medicalCouncilNumber}
                                onChange={(e) => setDoctorSettings((prev) => ({ ...prev, medicalCouncilNumber: e.target.value }))}
                            />
                        </div>

                        <div className="mb-3 form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="providesVirtual"
                                checked={doctorSettings.providesVirtualAppointments}
                                onChange={(e) =>
                                    setDoctorSettings((prev) => ({
                                        ...prev,
                                        providesVirtualAppointments:
                                        e.target.checked }
                                    ))
                                }
                            />
                            <label className="form-check-label" htmlFor="providesVirtual">
                                Offer Virtual Appointments
                            </label>

                        </div>

                        <button type="submit" className="btn btn-success w-100 mt-2">
                            Update Details
                        </button>

                    </form>

                    {userDetails?.practice && (
                        <div className="mt-4">
                            <h5 className="mb-3">Practice</h5>
                            <div className="p-3 border rounded bg-light">
                                <div className="fw-semibold">{userDetails.practice.name}</div>
                                <div className="text-muted small">{userDetails.practice.address}</div>
                                <div className="text-muted small">{userDetails.practice.phoneNumber}</div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSaveAvailability}>

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

                        <button type="submit" className="btn btn-success w-100 mt-2 mb-4">
                            Save Availability
                        </button>

                    </form>

                </div>
            </div>
        </div>

    );
}

export default DoctorSettings;
