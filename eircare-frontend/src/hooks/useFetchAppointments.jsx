import { useState, useEffect } from "react";
import { fetchPatientAppointments, fetchDoctorAppointments } from "../services/appointmentService";

export const useFetchAppointments = (userId, userType) => {

    const [appointments, setAppointments] = useState([]);
    const [appointmentsLoading, setAppointmentsLoading] = useState(true);

    useEffect(() => {

        const fetchAppointmentsData = async () => {

            try {

                setAppointmentsLoading(true);

                const data = 
                userType === "PATIENT"
                    ? await fetchPatientAppointments(userId)
                    : await fetchDoctorAppointments(userId);

                setAppointments(data);

                setAppointmentsLoading(false);
            }
            catch (error) {

                setAppointmentsLoading(false);
                console.error(error);
            }
        };

        if (userId) {
            fetchAppointmentsData();
        }
    },
        [userId, userType]);

    const refetchAppointments = async () => {

        try {
            setAppointmentsLoading(true);

            const data = 
            userType === "PATIENT"
                ? await fetchPatientAppointments(userId)
                : await fetchDoctorAppointments(userId);

            setAppointments(data);
        }
        catch (error) {
            console.error(error);

            alert("Failed to load appointments: " + error.message);
        
        } finally
        {
            setAppointmentsLoading(false);
        }
    };

    return { 
        appointments, 
        setAppointments, 
        appointmentsLoading, 
        refetchAppointments };
};
