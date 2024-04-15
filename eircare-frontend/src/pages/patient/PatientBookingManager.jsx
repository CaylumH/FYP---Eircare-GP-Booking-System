import { useState } from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated, getRole } from "../../services/authService";
import { cancelAppointment as cancelAppointmentService, openVirtualAppointmentRoom as openVirtualRoomService, checkAppointmentCancelled } from "../../services/appointmentService";
import { useFetchAppointments } from "../../hooks/useFetchAppointments";

function PatientBookingManager() {

    const [statusTab, setStatusTab] = useState("UPCOMING"); //UPCOMING PAST CANCELLED
    const [selectedAppointment, setSelectedAppointment] = useState(null);

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

    const isCancellationAllowed = (appointment) => {

        const hourstilAppointment = (new Date(appointment.appointmentStart) - new Date()) / (1000 * 60 * 60);
        return hourstilAppointment > 12;
    };

    const cancelAppointment = async (appointmentId, appointment) => {

        if (!isCancellationAllowed(appointment)) {
            alert("It is 12 hours until your appointment. You cannot cancel now");
            
            return;
        }
        try {
            await cancelAppointmentService(appointmentId);
            refetchAppointments(); //referesh after cancel
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

                                            <div className="text-muted small mb-2">{appointment.doctor.practice?.name}</div>

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
                                            <button
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={() => setSelectedAppointment(appointment)}
                                            >Details</button>
                                            {statusTab === "UPCOMING" && (
                                                <button
                                                    onClick={() => cancelAppointment(appointment.appointmentId, appointment)}
                                                    className="btn btn-outline-danger btn-sm"
                                                    disabled={!isCancellationAllowed(appointment)}
                                                    title={!isCancellationAllowed(appointment) ? "Cannot cancel within 12 hours of appointment" : ""}
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
            {selectedAppointment && (
                <div>
                    <div className="modal-backdrop fade show"></div>

                    <div className="modal d-block" onClick={() => setSelectedAppointment(null)}>

                        <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>

                            <div className="modal-content">

                                <div className="modal-header bg-success text-white">

                                    <h5 className="modal-title">Appointment Details

                                    </h5>

                                    <button type="button" 
                                    className="btn-close btn-close-white" 
                                    onClick={() => setSelectedAppointment(null)}>

                                    </button>
                                </div>

                                <div className="modal-body">
                                    
                                    <p>
                                        <strong>Doctor:</strong> Dr. {selectedAppointment.doctor.firstName} {selectedAppointment.doctor.lastName}</p>
                                    <p>
                                        <strong>Practice:</strong> {selectedAppointment.doctor.practice?.name || "n/a"}
                                        </p>
                                    <hr />
                                    <p>
                                        <strong>Start:</strong> {new Date(selectedAppointment.appointmentStart).toLocaleString()}</p>
                                        
                                    <p><strong>End:</strong> {new Date(selectedAppointment.appointmentEnd).toLocaleString()}</p>
                                    <p><strong>Type:</strong> {selectedAppointment.appointmentType}</p>
                                    <p>
                                        <strong>Consultation:</strong> {selectedAppointment.consultationType?.replace(/_/g, " ")}</p>
                                    <p>
                                        <strong>Status:</strong> {selectedAppointment.appointmentStatus}
                                        </p>

                                    {selectedAppointment.appointmentDescription && (
                                        <p><strong>Description:</strong> {selectedAppointment.appointmentDescription}</p>
                                    )}
                                    <p><strong>Translator Required:</strong> {selectedAppointment.needsTranslator 
                                    ? "Yes" 
                                    : "No"}</p>

                                    {selectedAppointment.needsTranslator && (
                                        <p><strong>Translator Language:</strong> {selectedAppointment.translatorLanguage || "n/a"}</p>
                                    )
                                    }
                                </div>

                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={() => setSelectedAppointment(null)}>Close</button>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>
            )
            }
            </div>
        );
    }


    return <div>Invalid role</div>;
}export default PatientBookingManager;
