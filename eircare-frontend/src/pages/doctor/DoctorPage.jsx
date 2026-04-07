import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import "../../App.css";
import DoctorCard from "../../components/Doctor/DoctorCard";
import PatientBookingModal from "../../components/Appointment/PatientBookingModal";
import PatientAppointmentScheduleLayout from "../../components/Appointment/PatientAppointmentScheduleLayout";
import { isAuthenticated, getRole, getToken } from "../../services/authService";
import { apiRequest } from "../../utils/ApiRequest";
import { bookAppointment as bookAppointmentService } from "../../services/appointmentService";
import { useFetchUserDetails } from "../../hooks/useFetchUserDetails";
import { useWeeklySchedule } from "../../hooks/useWeeklySchedule";
import DoctorFooter from "../../components/DoctorFooter";
import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";


function DoctorPage() {

    const { id: doctorId } = useParams();

    const [selectTimeSlot, setSelectedTimeSlot] = useState(null);

    const [appointmentForm, setAppointmentForm] = useState({
        searchInput: "",
        selectedPatientId: "",
        message: "",
        appointmentType: "IN_PERSON",
        consultationType: "GENERAL_CONSULTATION",
    }
);

    const [needsTranslator, setNeedsTranslator] = useState(false);
    const [translatorLanguage, setTranslatorLanguage] = useState("");
    
    const [availability, setAvailability] = useState([]);

    const patientId = localStorage.getItem("patientId");

    useEffect(() => {

        const fetchAvailability = async () => {

            try 
            {
                const response = await apiRequest(`/api/doctors/${doctorId}/availability/all`, {
                    headers: { Authorization: "Bearer " + getToken() },
                });

                const weekOrder = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"];

const sorted = response.sort((a, b) => weekOrder.indexOf(a.day) - weekOrder.indexOf(b.day));
            setAvailability(sorted);
        
        } catch (error) {
                console.error("Could not load foctor availability", error);
            }
        };
        fetchAvailability();
    }, [doctorId]);

    const { userDetails: doctor, loading } = useFetchUserDetails(doctorId, "DOCTOR");

    const { weekStartDate, 
        weekEndDate, 
        selectedWeekMondayDate, 
        setSelectedWeekMondayDate, 
        weekTimeSlots, 
        refetchWeekTimeSlots 
    } = useWeeklySchedule(doctorId);


    async function bookAppointment(date, time, description, type, consultationType, needsTranslator, selectedTranslatorLanguage) {

        if (!description) {

            alert("Please describe your symptoms before booking");
            
            return;
        }

        if (needsTranslator && !selectedTranslatorLanguage) {
           
            alert("Please select a translator language");
            return;
        }

        if (!patientId) {
           
            alert("Could not determine patient ID. Please log in again.");
            return;
        }

        try {

            const appointmentStart = date + "T" + time + ":00";

            await bookAppointmentService(doctorId, 
                patientId, 
                appointmentStart, 
                description, 
                type, 
                consultationType, 
                needsTranslator, 
                selectedTranslatorLanguage
            );

            alert("Appointment booked!");

            setSelectedTimeSlot(null);

            setAppointmentForm((prev) => ({
                ...prev,
                message: "",
                appointmentType: "IN_PERSON",
                consultationType: "GENERAL_CONSULTATION",
            }
        )
    );

            setNeedsTranslator(false);
            setTranslatorLanguage("");

            //ui updates instatly
            refetchWeekTimeSlots();

        } catch (error) {

            console.error(error);
            alert("Booking failed: " + error.message);
        }
    }

    if (!isAuthenticated()) return <Navigate to="/" replace />;

    if (getRole() === "ADMIN") return <Navigate to="/admin/dashboard" replace />;

    if (getRole() !== "PATIENT") return <Navigate to="/" replace />;

    if (loading === true) {

        return <div className="text-center mt-5">Loading timeslots...</div>;
    }

    return (

        <>
        <div className="container py-4 d-flex flex-column align-items-center">

            <DoctorCard doctor={doctor} id={doctorId} />

            {availability.length > 0 && (

                <div className="card shadow-sm rounded-3 w-100 mb-3" 
                style={{ maxWidth: "860px" }}>

                    <div className="card-body p-3">

                        <h6 className="fw-semibold mb-2">Opening Hours</h6>

                        <div className="row row-cols-2 row-cols-sm-4 g-2">

                            {availability.map((slot) => (

                                <div key={slot.day} className="col">

                                    <div className="text-muted small text-capitalize">

                                        {slot.day.charAt(0) + slot.day.slice(1).toLowerCase()}
                                        </div>

                                    <div className="small">
                                        {slot.openingTime} - {slot.closingTime}
                                        </div>

                                </div>
                            )
                        )
                            }
                        </div>
                    
                    
                    </div>
                </div>
            )}

            <div className="card shadow-sm rounded-3 w-100 mb-3" style={{ maxWidth: "1000px" }}>
                
                <div className="card-body p-3">
                    
                    <div className="d-flex justify-content-between align-items-center">
                        
                        <button
                         className="btn btn-outline-success nav-btn" 
                         onClick={() => {
                            const previousWeek = new Date(selectedWeekMondayDate);
                            previousWeek.setDate(selectedWeekMondayDate.getDate() - 7);
                            setSelectedWeekMondayDate(previousWeek);
                        }}
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <span className="fw-semibold">
                            {weekStartDate} - {weekEndDate}
                            </span>

                        <button 
                        className="btn btn-outline-success nav-btn" 
                        onClick={() => {
                            const nextWeek = new Date(selectedWeekMondayDate);
                            nextWeek.setDate(selectedWeekMondayDate.getDate() + 7);
                            setSelectedWeekMondayDate(nextWeek);
                        }
                        }
                        >
                            <ChevronRight size={18} />
                        </button>

                    </div>
                </div>
            </div>


            <PatientAppointmentScheduleLayout
                weekTimeSlots={weekTimeSlots}
                setSelectTimeSlot={setSelectedTimeSlot}
            />


            {selectTimeSlot && (

                <PatientBookingModal
                    selectTimeSlot={selectTimeSlot}
                    setSelectTimeSlot={setSelectedTimeSlot}
                    doctor={doctor}
                    appointmentMessage={appointmentForm.message}

                    setAppointmentMessage={(value) => setAppointmentForm((prev) => ({ ...prev, message: value }))}
                    appointmentType={appointmentForm.appointmentType}
                    setAppointmentType={(value) => setAppointmentForm((prev) => ({ ...prev, appointmentType: value }))}
                    consultationType={appointmentForm.consultationType}
                    setConsultationType={(value) => setAppointmentForm((prev) => ({ ...prev, 
                        consultationType: value }))}

                    needsTranslator={needsTranslator}
                    setNeedsTranslator={setNeedsTranslator}
                    translatorLanguage={translatorLanguage}
                    setTranslatorLanguage={setTranslatorLanguage}
                    onConfirm={bookAppointment}
                />
            )}

        </div>

        <DoctorFooter doctor={doctor} doctorId={doctorId} />
        </>
    );
}


export default DoctorPage;
