import React, { useEffect, useState } from "react";
import { getToken } from "../services/authService";
import { apiRequest } from "../utils/ApiRequest";

const DAY_ORDER = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

function DoctorFooter({ doctor, doctorId }) {

    const [availability, setAvailability] = useState([]);

    useEffect(() => {
        if (!doctorId) return;

        apiRequest(`/api/doctors/${doctorId}/availability/all`, {

            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`,
            },
        })
            .then((data) => {

                const sortedAvailability = [...data].sort((day1, day2) => {
                return DAY_ORDER.indexOf(day1.day) - DAY_ORDER.indexOf(day2.day);
            });

                setAvailability(sortedAvailability);
            })
            .catch(() => 
                {
                    setAvailability([]);
                });

    }, [doctorId]);

    const availabilityMap = Object.fromEntries(
    availability.map((dayAvailability) => {
        return [dayAvailability.day, dayAvailability];
    })
);

    return (
        <footer className="bg-dark text-light mt-5 py-5">

            <div className="container">

                <div className="row g-4">

                    <div className="col-md-4">

                        <h5 className="fw-bold mb-3">
                            {doctor?.practiceName || "GP Practice"}
                        </h5>

                        <p className="mb-1 text-secondary">
                            Dr. {doctor?.firstName} {doctor?.lastName}
                        </p>

                        {doctor?.practiceAddress && (

                            <p className="mb-1">

                                <span className="text-secondary me-2">
                                    Address
                                    </span>

                                {doctor.practiceAddress}
                            </p>
                        )}

                        {doctor?.phoneNumber && (

                            <p className="mb-1">
                                <span className="text-secondary me-2">Phone</span>

                                <a
                                    href={`tel:${doctor.phoneNumber}`}
                                    className="text-light text-decoration-none"
                                >
                                    {doctor.phoneNumber}
                                </a>
                            </p>
                        )}
                    </div>

                    <div className="col-md-4">
                        <h5 className="fw-bold mb-3">Opening Hours</h5>

                        {availability.length === 0 ? (

                            <p className="text-secondary">No hours</p>

                        ) : (
                            <table className="table table-sm table-dark table-borderless mb-0">

                                <tbody>

                                    {DAY_ORDER.map((day) => {

                                        const availabilityEntry = availabilityMap[day];

                                        const label = 
                                        day.charAt(0) + 
                                        day.slice(1).toLowerCase();

                                        return (
                                            <tr key={day}>

                                                <td className="ps-0 text-secondary">
                                                    {label}
                                                    </td>

                                                <td 
                                                className={
                                                    `text-end pe-0 ${!availabilityEntry 
                                                    ? "text-danger" 
                                                    : "text-light"}`}
                                                    >


                                                    {availabilityEntry
                                                        ? `${availabilityEntry.openingTime} - ${availabilityEntry.closingTime}`
                                                        : "Closed"}
                                                </td>
                                            </tr>
                                        );
                                    })
                                    }

                                </tbody>
                            </table>
                        )}
                    </div>

                </div>

                <hr className="border-secondary mt-4" />

            </div>

        </footer>
    );
}

export default DoctorFooter;
