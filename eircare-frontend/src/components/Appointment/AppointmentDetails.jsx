function AppointmentDetails({ selectedAppointment, setSelectedAppointment, cancelAppointment, openVirtualAppointmentModal }) {

    const formatDateTime = (dateTime) => {

        return new Date(dateTime).toLocaleString();
    };

    const closeModal = () => { //claering selection should close modal
        setSelectedAppointment(null);
    };

    const handleCancel = () => {

        if (!selectedAppointment) return;

        cancelAppointment(selectedAppointment.appointmentId);

        //TODO: Might add confirm popup before cancel
        closeModal();
    };

    if (!selectedAppointment) return null;

    const patient = selectedAppointment.patient ?? null;

    const isCancellable =
        selectedAppointment.appointmentStatus !== "CANCELLED" &&
        selectedAppointment.appointmentStatus !== "COMPLETED";
    return (
        <>
            <div className="modal-backdrop fade show"></div>

            <div className="modal d-block" onClick={closeModal}>

                <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>

                    <div className="modal-content">

                        <div className="modal-header bg-success text-white">

                            <h5 className="modal-title">Appointment Details</h5>

                            <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
                        </div>

                        <div className="modal-body">
                            {patient && (
                                <>
                                    <p><strong>Patient:</strong> {patient.firstName} {patient.lastName}</p>

                                    <p><strong>Email:</strong> {patient.user?.email || "n/a"}</p>

                                    <p><strong>Phone:</strong> {patient.phoneNumber || "n/a"}</p>

                                    <p><strong>Address:</strong> {patient.address || "n/a"}</p>
                                    <hr />
                                </>
                            )}
                            <p><strong>Start:</strong> {formatDateTime(selectedAppointment.appointmentStart)}</p>

                            <p><strong>End:</strong> {formatDateTime(selectedAppointment.appointmentEnd)}</p>

                            <p><strong>Type:</strong> {selectedAppointment.appointmentType}</p>

                            <p><strong>Consultation:</strong> {selectedAppointment.consultationType}</p>

                            <p><strong>Status:</strong> {selectedAppointment.appointmentStatus}</p>

                            <p><strong>Description:</strong> {selectedAppointment.appointmentDescription}</p>

                            <p><strong>Translator Required:</strong> 
                            {selectedAppointment.needsTranslator ? "Yes" : "No"}</p>

                            {selectedAppointment.needsTranslator && (
                                <p>
                                    <strong>Translator Language:</strong> {selectedAppointment.translatorLanguage || "n/a"}
                                    </p>
                            )}
                        </div>

                        <div className="modal-footer">

                            {selectedAppointment.appointmentType === "VIRTUAL" && isCancellable && ( //button only show if virtual appt

                                <button className="btn btn-success" type="button"
                                    onClick={() => openVirtualAppointmentModal(selectedAppointment.appointmentId)}>

                                    Join Meeting
                                </button>
                            )}
                            {isCancellable && (
                                <button className="btn btn-danger" 
                                type="button" 
                                onClick={handleCancel}>
                                    Cancel Appointment
                                </button>
                            )}
                            <button className="btn btn-secondary" 
                            type="button" 
                            onClick={closeModal}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

}
export default AppointmentDetails;