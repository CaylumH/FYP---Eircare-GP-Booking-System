import PatientFilter from '../Doctor/PatientFilter';
import { format } from 'date-fns';
import { CONSULTATION_DESCRIPTIONS } from '../../constants/consultationTypes';

function BookingModal({
  selectTimeSlot,
  setSelectTimeSlot,
  sortedPatientsBySearch,
  appointmentForm,
  setAppointmentForm,
  markSlotUnavailable,
  bookAppointment,
  providesVirtual = false //by default theu shouldnt provide 
}
) {
  const selectedPatient = sortedPatientsBySearch.find(
    (patient) => String(patient.id) === String(appointmentForm.selectedPatientId) //test
  );

  const consultationOptions = Object.entries(CONSULTATION_DESCRIPTIONS).map(([value, label]) => (
    { value, label })
  );


  const handleAppointmentTypeChange = (e) => {
    setAppointmentForm(prev => (
      { ...prev, appointmentType: e.target.value }));
  };

  const handleConsultationTypeChange = (e) => {
    setAppointmentForm(prev => ({ ...prev, consultationType: e.target.value }));
  };

  const handleMessageChange = (e) => {
    setAppointmentForm(prev => (
      { ...prev, message: e.target.value }
    ));
  };

  const toggleTranslator = () => {
    setAppointmentForm(prev => (
      { ...prev, needsTranslator: !prev.needsTranslator }));
  };

  const handleTranslatorLanguageChange = (e) => {
    setAppointmentForm(prev => ({ ...prev, translatorLanguage: e.target.value })
  );
  };

  const handleClose = () => {

    setSelectTimeSlot(null); //reset slot select on close

    setAppointmentForm({
      searchInput: "",
      selectedPatientId: "",
      message: "",
      appointmentType: "IN_PERSON",
      consultationType: "GENERAL_CONSULTATION",
      needsTranslator: false,
      translatorLanguage: ""
    });

  };

  const handleBook = () => {

    if (!selectTimeSlot) return;

    bookAppointment(
      selectTimeSlot.date,
      selectTimeSlot.time,
      appointmentForm.message.trim(),
      appointmentForm.appointmentType,
      appointmentForm.consultationType,
      appointmentForm.needsTranslator,
      appointmentForm.translatorLanguage
    );
  };

  const handleUnavailable = () => {

    markSlotUnavailable(selectTimeSlot.date, selectTimeSlot.time);
  };

  if (!selectTimeSlot) return null; //Dont render unless slot chosen

  return (
    <>
    <div className="modal-backdrop fade show"></div>

    <div className="modal show d-block" tabIndex="-1">

      <div className="modal-dialog modal-lg modal-dialog-centered">

        <div className="modal-content">

          <div className="modal-header bg-success text-white">

            <h5 className="modal-title">Book Appointment</h5>

            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleClose}
            />
          </div>

          <div className="modal-body">
          
            <div className="alert alert-info mb-3">
              <strong>Selected Time:</strong> {format(new Date(selectTimeSlot.date), 'PPP')} at {selectTimeSlot.time}
            </div>


            <div className="mb-4">

              <label className="form-label fw-bold">Select Patient:</label>

              <PatientFilter
                patients={sortedPatientsBySearch}
                searchInput={appointmentForm.searchInput}
                setSearchInput={(value) => 
                  setAppointmentForm(prev => ({ ...prev, 
                    searchInput: value })
                )
              }
                searchedPatientId={appointmentForm.selectedPatientId}
                setSearchedPatientId={(id) => setAppointmentForm(prev => ({
                   ...prev, selectedPatientId: id 
                  }))
                }
              />
              {selectedPatient && (
                <div className="alert alert-success mt-2">
                  Selected: {selectedPatient.firstName} {selectedPatient.lastName} ({selectedPatient.user?.email})
                </div>
              )
              }
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">Description:</label>

              <textarea
                className="form-control"
                rows={3}
                placeholder="Enter description or reason for appointment"
                value={appointmentForm.message}
                onChange={handleMessageChange}
              />
            </div>

            <div className="mb-4">

              <label className="form-label fw-bold">Appointment Type:</label>
              <div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="inPerson"
                    name="appointmentType"
                    value="IN_PERSON"
                    checked={appointmentForm.appointmentType === "IN_PERSON"}
                    onChange={handleAppointmentTypeChange}
                  />
                  <label className="form-check-label" htmlFor="inPerson">
                    In-Person
                  </label>

                </div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="virtual"
                    name="appointmentType"
                    value="VIRTUAL"
                    checked={appointmentForm.appointmentType === "VIRTUAL"}
                    onChange={handleAppointmentTypeChange}
                    disabled={!providesVirtual}
                  />

                  <label className="form-check-label" htmlFor="virtual">
                    Virtual {!providesVirtual && <span className="text-muted">(Not Available)</span>}
                  </label>
                </div>

              </div>

            </div>

            <div className="mb-4">

              <label className="form-label fw-bold">Consultation Type:</label>

              <select
                className="form-select"
                value={appointmentForm.consultationType}
                onChange={handleConsultationTypeChange}
              >
                {consultationOptions.map(option => (

                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>

                ))
                }
              </select>

            </div>

            <div className="mb-4">

              <div className="form-check">

                <input
                  className="form-check-input"
                  type="checkbox"
                  id="needsTranslator"
                  checked={appointmentForm.needsTranslator}
                  onChange={toggleTranslator}
                />

                <label className="form-check-label fw-bold" htmlFor="needsTranslator">
                  Needs Translator
                </label>

              </div>
              {appointmentForm.needsTranslator && (
                <input
                  type="text"
                  className="form-control mt-2"
                  placeholder="Translator Language"
                  value={appointmentForm.translatorLanguage}
                  onChange={handleTranslatorLanguageChange}
                />
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button className="btn btn-warning" onClick={handleUnavailable}>
              Mark Unavailable
            </button>
            <button 
              className="btn btn-success" 
              onClick={handleBook}
              disabled={!appointmentForm.selectedPatientId || !appointmentForm.message.trim()}
            >
              Confirm Booking
            </button>

          </div>
          
        </div>
      </div>
    </div>
    </>
  );
}

export default BookingModal;

