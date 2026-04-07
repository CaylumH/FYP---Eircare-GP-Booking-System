import { getToken } from './authService';
import { apiRequest } from '../utils/ApiRequest';

export const fetchWeeklyTimeSlots = async (doctorId, weekStartDate, weekEndDate) => {
    const token = getToken();

    const freeAppointmentsResponse = await apiRequest(`/api/appointments/doctor/${doctorId}/timeslots?weekStart=${weekStartDate}&weekEnd=${weekEndDate}`, {
        headers: {

            Authorization: "Bearer " + token,
        },});
    return freeAppointmentsResponse;
};

export const cancelAppointment = async (appointmentId) => {

    const token = getToken();

    const cancelResponse = await apiRequest(`/api/appointments/${appointmentId}/cancel`, {

        method: "POST",
        headers: {
            Authorization: "Bearer " + token
        },
    });
    
    return cancelResponse;
};

export const openVirtualAppointmentRoom = async (appointmentId) => {

    const token = getToken();
    const response = await apiRequest(`/api/appointments/${appointmentId}/virtual-appointment-room`, {

        headers: {
            Authorization: "Bearer " + token,
        },
    }
);
    return response;
};

export const checkAppointmentCancelled = (appointment) => {
    return appointment.appointmentStatus === "CANCELLED";
};

export const fetchDoctorAppointments = async (doctorId) => {

    const token = getToken();
    const response = await apiRequest(`/api/appointments/doctor/${doctorId}`, {
        headers: {
            Authorization: "Bearer " + token,

        },
    });
    return response;
};

export const fetchPatientAppointments = async (patientId) => {

    const token = getToken();
    const appointmentsResponse = await apiRequest(`/api/appointments/patient/${patientId}`, {
        headers: {

            Authorization: "Bearer " + token,
        },
    });

    return appointmentsResponse;
};

export const bookAppointment = async (doctorId, patientId, appointmentStart, description, type, consultationType, needsTranslator = false, translatorLanguage = null) => {
    
    const token = getToken();

    const appointmentResponse = await apiRequest("/api/appointments", {
        
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },

        body: JSON.stringify({
            doctor: { id: Number(doctorId) },
            patient: { id: Number(patientId) },
            appointmentStart: appointmentStart,
            appointmentDescription: description,
            appointmentType: type,
            appointmentStatus: "BOOKED",
            consultationType: consultationType,
            needsTranslator: needsTranslator ?? false,
            translatorLanguage: needsTranslator ? translatorLanguage : null,
        }
    ),
    });

    return appointmentResponse;
};

export const markSlotUnavailable = (doctorId, dateTime) => {

    const token = getToken();

    const [date, time] = dateTime.split("T");

    return apiRequest(
        `/api/appointments/doctor/${doctorId}/mark-unavailable?date=${date}&time=${time}`,
        {
            method: "POST",
            headers: {
                Authorization: "Bearer " + token
            }
        }
        
    );
};
