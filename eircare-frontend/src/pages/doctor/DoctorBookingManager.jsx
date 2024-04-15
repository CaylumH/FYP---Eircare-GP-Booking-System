import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Navigate } from "react-router-dom";
import AppointmentDetails from "../../components/Appointment/AppointmentDetails";
import BookingModal from "../../components/Appointment/BookingModal";
import PatientFilter from "../../components/Doctor/PatientFilter";
import DoctorAppointmentScheduleLayout from "../../components/Appointment/AppointmentScheduleLayout";
import { getToken, isAuthenticated, getRole } from "../../services/authService";
import { cancelAppointment as cancelAppointmentService, openVirtualAppointment, checkAppointmentCancelled, bookAppointment as bookAppointmentService, markSlotUnavailable as markSlotUnavailableService } from "../../services/appointmentService";
import { apiRequest } from "../../utils/ApiRequest";
import { useFetchAppointments } from "../../hooks/useFetchAppointments";
import { useFetchUserDetails } from "../../hooks/useFetchUserDetails";
// import { useWeekNavigation } from "../../hooks/useWeekNavigation";
import WeekNavigator from "../../components/WeekNavigator";

import { useWeeklySchedule } from "../../hooks/useWeeklySchedule";


function DoctorBookingManager() {   //File handling too much atm, future work (for report) would definitely involve migrating to custom hooks

    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [selectTimeSlot, setSelectTimeSlot] = useState(null);
    const [sortedPatientsBySearch, setSortedPatientsBySearch] = useState([]);

    const [appointmentForm, setAppointmentForm] = useState(
        {
            searchInput: "",
            selectedPatientId: "",
            message: "",
            appointmentType: "IN_PERSON",
            consultationType: "GENERAL_CONSULTATION",
            needsTranslator: false,
            translatorLanguage: ""
        });

    const id = localStorage.getItem("doctorId");
    const { userDetails: doctor } = useFetchUserDetails(id, "DOCTOR");
    const { appointments, setAppointments, appointmentsLoading, refetchAppointments } = useFetchAppointments(id, "DOCTOR");
    const { weekStartDate, weekEndDate, selectedWeekMondayDate, setSelectedWeekMondayDate, weekTimeSlots, refetchWeekTimeSlots } = useWeeklySchedule(id);

 
    const openVirtualAppointmentModal = openVirtualAppointment;

    const isAppointmentCancelled = checkAppointmentCancelled;

    useEffect(() => {

        //TODO: if token not valid redirte
        const fetchPatients = async () => {
            try {
                const token = getToken();

                const data = await apiRequest("/api/patients", {
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                });

                setSortedPatientsBySearch(data);
            } catch (error) {
                console.error("Failed to fetch patients: " + error);
            }
        };

        fetchPatients();
    }, []);

    function getAppointmentForTimeSlot(date, time) {

        const appointment = appointments.filter(
            (appointment) => {

                if (!appointmentForm.selectedPatientId || appointment.appointmentStatus === "UNAVAILABLE") {
                    return true;
                }

                return String(appointment.patient?.id) === String(appointmentForm.selectedPatientId); // filtering appointments based on selected patient
            }).find((appointment) => {

                if (appointment.appointmentStatus === "CANCELLED") return false;

                const appointmentStartDateTime = new Date(appointment.appointmentStart);
                const appointmentEndDateTime = new Date(appointment.appointmentEnd);

                const appointmentDate = format(appointmentStartDateTime, "yyyy-MM-dd");

                if (appointmentDate !== date) {
                    return false;
                }

                const [slotHours, slotMinutes] = time.split(":");
                const slotDateTime = new Date(appointmentStartDateTime);
                slotDateTime.setHours(Number(slotHours), Number(slotMinutes), 0, 0);

                return appointmentStartDateTime <= slotDateTime && appointmentEndDateTime > slotDateTime;
            });


        return appointment;
    }

    const cancelAppointment = async (appointmentId) => {

        try {

            await cancelAppointmentService(appointmentId);

            refetchAppointments();
            refetchWeekTimeSlots();

        } catch (error) {

            console.error(error);
            alert("Cancellation failed" + error.message);
        }
    }

    async function bookAppointment(date, time, description, type, consultationType, needsTranslator, translatorLanguage) {

        if (!appointmentForm.selectedPatientId) {

            alert("Please select a patient.");
            return;
        }

        if (!description) {

            alert("Please add a short description.");
            return;
        }

        try {
            const appointmentStart = date + "T" + time + ":00";

            await bookAppointmentService(id, 
                appointmentForm.selectedPatientId, 
                appointmentStart, 
                description, 
                type, 
                consultationType, 
                needsTranslator,
                 translatorLanguage
                );

            setSelectTimeSlot(null);
            setAppointmentForm({ searchInput: "",
                 selectedPatientId: "",
                  message: "", 
                  appointmentType: "IN_PERSON", 
                  consultationType: "GENERAL_CONSULTATION", 
                  needsTranslator: false, 
                  translatorLanguage: "" 
                });

            refetchAppointments();
            refetchWeekTimeSlots();
        }
        catch (error) {
            console.error(error);
            alert("Failed to book appointment " + error.message);
        }
    }


    async function markSlotUnavailable(date, time) {

        try {
            const appointmentStart = date + "T" + time + ":00";

            await markSlotUnavailableService(id, appointmentStart);

            setSelectTimeSlot(null);
            setAppointmentForm({
                searchInput: "",
                selectedPatientId: "",
                message: "",
                appointmentType: "IN_PERSON",
                consultationType: "GENERAL_CONSULTATION",
                needsTranslator: false,
                translatorLanguage: ""
            });

            refetchAppointments();
            refetchWeekTimeSlots();
        } catch (error) {
            console.error(error);
            alert("Mark slot unavailable failed: " + error.message);
        }
    }


    if (!isAuthenticated()) {
        return <Navigate to="/" replace />;
    }

    if (getRole() === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
    if (getRole() === "PATIENT") {
        return <Navigate to="/patient/appointments" replace />;
    }

    if (appointmentsLoading) {
        return <div className="text-center mt-5">Loading Appointments...</div>;
    }

    if (isAuthenticated() && getRole() === "DOCTOR") {

        const today = new Date().toISOString().split("T")[0];


        const todaysAppointments = appointments.filter((appointment) => { 
            if (!appointment.appointmentStart) return false;
            if (appointment.appointmentStatus === "CANCELLED" || appointment.appointmentStatus === "UNAVAILABLE") return false;

            return appointment.appointmentStart.split("T")[0] === today;
        });

        return (
            <div className="container py-4 d-flex flex-column align-items-center">
                
                <h2 className="mb-2 text-center fw-bold text-success">
                    My Schedule
                    </h2>
                
                <p className="text-muted mb-4 text-center">
                    {todaysAppointments.length === 0
                        ? "No appointments today"
                        : `${todaysAppointments.length} appointment${todaysAppointments.length > 1 
                        ? "s" 
                        : ""} today`}
                </p>

                <div className="card shadow-sm rounded-3 w-100 mb-3" style={{ maxWidth: "1000px" }}>
                    <div className="card-body p-3">

                        <div className="mb-3">
                        <WeekNavigator
                            weekStartDate={weekStartDate}
                            weekEndDate={weekEndDate}
                            selectedWeekMondayDate={selectedWeekMondayDate}
                            setSelectedWeekMondayDate={setSelectedWeekMondayDate}
                        />
                        </div>

                        <PatientFilter
                            patients={sortedPatientsBySearch}
                            searchInput={appointmentForm.searchInput}
                            setSearchInput={(value) => 
                                setAppointmentForm((prev) => ({
                                ...prev, searchInput: value
                            })
                        )}
                            searchedPatientId={appointmentForm.selectedPatientId}
                            setSearchedPatientId={(id) => 
                                setAppointmentForm((prev) => ({ ...prev, selectedPatientId: id }))}
                        />

                    </div>
                </div>

                <DoctorAppointmentScheduleLayout
                    weekTimeSlots={weekTimeSlots}
                    getAppointmentForTimeSlot={getAppointmentForTimeSlot}
                    setSelectedAppointment={setSelectedAppointment}
                    openVirtualAppointmentModal={openVirtualAppointmentModal}
                    cancelAppointment={cancelAppointment}
                    isAppointmentCancelled={isAppointmentCancelled}
                    setSelectTimeSlot={setSelectTimeSlot}
                />

                {selectedAppointment && (

                    <AppointmentDetails
                        selectedAppointment={selectedAppointment}
                        setSelectedAppointment={setSelectedAppointment}
                        cancelAppointment={cancelAppointment}
                        openVirtualAppointmentModal={openVirtualAppointmentModal}
                    />
                )}


                {selectTimeSlot && (
                    <BookingModal
                        selectTimeSlot={selectTimeSlot}
                        setSelectTimeSlot={setSelectTimeSlot}
                        sortedPatientsBySearch={sortedPatientsBySearch}
                        appointmentForm={appointmentForm}
                        setAppointmentForm={setAppointmentForm}
                        markSlotUnavailable={markSlotUnavailable}
                        bookAppointment={bookAppointment}
                        providesVirtual={doctor?.providesVirtualAppointments ?? false}
                    />
                )
                }
            </div>);
    }

    return (
        <div>Invalid role</div>
    );

}


export default DoctorBookingManager;
