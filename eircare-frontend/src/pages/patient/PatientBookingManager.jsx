import { useState } from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated, getRole } from "../../services/authService";
import { cancelAppointment as cancelAppointmentService, openVirtualAppointmentRoom as openVirtualRoomService, checkAppointmentCancelled } from "../../services/appointmentService";
import { useFetchAppointments } from "../../hooks/useFetchAppointments";

function PatientBookingManager() {

    const [statusTab, setStatusTab] = useState("UPCOMING"); //UPCOMING PAST CANCELLED

    const patientId = localStorage.getItem("patientId");
    
    const { appointments, appointmentsLoading: loading, refetchAppointments } = useFetchAppointments(patientId, "PATIENT");

    const openVirtualAppointmentRoom = async (appointmentId) => {
        try {

            const responseData = await openVirtualRoomService(appointmentId);

            window.open(`https://meet.jit.si/${responseData.roomName}`, "_blank", "noopener,noreferrer");
        
        } catch (error) {
            if (error.status === 409) {
                alert("The doctor has not started this appointment yet. Please wait.");
                return;
            }

            console.error(error);
            alert("Failed to join call: " + error.message);
        }

    };

    const cancelAppointment = async (appointmentId) => {
        try {

            await cancelAppointmentService(appointmentId);
            refetchAppointments(); //refreshh after cancel

        } catch (error) {
            console.error(error);

            alert("Cancellation Failed" + error.message);
        }
    };

    const timeNow = new Date();

    const appointmentsFilteredByStatus = appointments.filter((appointment) => {

        const appointmentEnd = new Date(appointment.appointmentEnd);

        if (statusTab === "UPCOMING") {
            
            return appointment.appointmentStatus === "BOOKED" && appointmentEnd > timeNow;
        } else if (statusTab === "PAST") {

            return appointment.appointmentStatus === "COMPLETED" ||

                (appointment.appointmentStatus === "BOOKED" && appointmentEnd <= timeNow);
        } else if (statusTab === "CANCELLED") {

            return checkAppointmentCancelled(appointment);
        }


        return false;
    });

    if (!isAuthenticated()) return <Navigate to="/" replace />;
    if (getRole() === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
    if (getRole() === "DOCTOR") return <Navigate to="/appointments" replace />;
    
    if (loading) return <div className="text-center mt-4">Loading Appointments...</div>;

    if (isAuthenticated() && getRole() === "PATIENT") {

        return (
            <div className="container py-4 d-flex flex-column align-items-center">
                
                <h2 className="mb-4 fw-bold text-success">My Appointments</h2>

                <div className="d-flex gap-2 mb-4">
                    {["UPCOMING", "PAST", "CANCELLED"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setStatusTab(tab)}
                            className={`btn btn-sm ${
                                statusTab === tab ? "btn-success" : "btn-outline-success"}`}
                        >
                            {tab.charAt(0) + tab.slice(1).toLowerCase()}
                        </button>
                    ))
                    }
                </div>

                {appointmentsFilteredByStatus.length === 0 ? (
                    <p className="text-muted">No appointments found.</p>
                ) : (

                    <div className="d-flex flex-column gap-3 w-100" style={{ maxWidth: "720px" }}>
                        
                        {appointmentsFilteredByStatus.map((appointment) => (

                            <div
                                key={appointment.appointmentId}
                                className={`card shadow-sm ${checkAppointmentCancelled(appointment) 
                                    ? "opacity-50" 
                                    : ""}`}
                            >
                                <div className="card-body">

                                    <div className="d-flex justify-content-between align-items-start gap-3">
                                        <div>

                                            <div className="fw-semibold">

                                                Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}

                                            </div>

                                            <div className="text-muted small mb-2">{appointment.doctor.practiceName}</div>

                                            <div className="mb-2">

                                                {new Date(appointment.appointmentStart).toLocaleString()}
                                            </div>

                                            <div className="d-flex gap-2 flex-wrap mb-1">

                                                <span className="badge bg-success-subtle text-success-emphasis border border-success-subtle">
                                                    {appointment.appointmentType}
                                                </span>
                                                
                                                <span className="badge bg-light text-muted border">
                                                    {appointment.consultationType?.replace(/_/g, " ")}
                                                </span>

                                            </div>
                                            {appointment.appointmentDescription && (
                                                <div className="small text-muted mt-1">
                                                    {appointment.appointmentDescription}
                                                </div>
                                            )}
                                            {appointment.needsTranslator && (
                                                <div className="small mt-1 text-muted">
                                                    Translator: {appointment.translatorLanguage || "n/a"}
                                                </div>
                                            )}

                                        </div>

                                        <div className="d-flex flex-column gap-2 align-items-end flex-shrink-0">
                                            {statusTab === "UPCOMING" && (
                                                <button
                                                    onClick={() => cancelAppointment(appointment.appointmentId)}
                                                    className="btn btn-outline-danger btn-sm"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            {appointment.appointmentType === "VIRTUAL" && statusTab === "UPCOMING" && (
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => openVirtualAppointmentRoom(appointment.appointmentId)}
                                                >
                                                    Join Call
                                                </button>
                                            )}
                                        </div>


                                    </div>
                                </div>
                            </div>

                        ))
                        }
                    </div>
                )}
            </div>
        );
    }
    
    
    return <div>Invalid role</div>;
}export default PatientBookingManager;
