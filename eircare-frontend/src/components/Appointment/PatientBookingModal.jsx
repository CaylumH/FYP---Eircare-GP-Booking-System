import { format } from 'date-fns';
import { CONSULTATION_DESCRIPTIONS } from '../../constants/consultationTypes';

function PatientBookingModal({
  selectTimeSlot,
  setSelectTimeSlot,
  doctor,
  appointmentMessage,
  setAppointmentMessage,
  appointmentType,
  setAppointmentType,
  consultationType,
  setConsultationType,
  needsTranslator,
  setNeedsTranslator,
  translatorLanguage,
  setTranslatorLanguage,
  onConfirm
}) {
  const resetForm = () => {
    setSelectTimeSlot(null);
    setAppointmentMessage("");

    setAppointmentType("IN_PERSON");
    setConsultationType("GENERAL_CONSULTATION");

    setNeedsTranslator(false);
    setTranslatorLanguage("");
  };

  const handleAppointmentTypeChange = (e) => {
    setAppointmentType(e.target.value);};

  const handleConsultationTypeChange = (e) => {setConsultationType(e.target.value);};

  const handleMessageChange = (e) => {
    setAppointmentMessage(e.target.value);
  };

  const toggleTranslator = () => {
    setNeedsTranslator(!needsTranslator);
  };

  const handleTranslatorLanguageChange = (e) => { //idk whether to have this or drop down menu of lanuguages
    setTranslatorLanguage(e.target.value);
  };

  if (!selectTimeSlot) return null;

  const consultationOptions = Object.entries(CONSULTATION_DESCRIPTIONS).map(([value, label]) => {
    return { 
      value, 
      label 
    };
  }
);



  return (
    <>
    <div className="modal-backdrop fade show"></div>

    <div className="modal show d-block" tabIndex="-1">

      <div className="modal-dialog modal-lg modal-dialog-centered">

        <div className="modal-content">

          <div className="modal-header bg-success text-white">

            <h5 className="modal-title">Confirm Booking with Dr. {doctor.firstName} {doctor.lastName}</h5>

            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={resetForm}
            />

          </div>

          <div className="modal-body">

            <div className="alert alert-info mb-3">
              <strong>Doctor:</strong> {doctor.firstName} {doctor.lastName}<br/>
              <strong>Practice:</strong> {doctor.practiceName}<br/>
              <strong>Time:</strong> {format(new Date(selectTimeSlot.date), 'PPP')} at {selectTimeSlot.time}

            </div>

            <div className="mb-4">

              <label className="form-label fw-bold">Description:</label>

              <textarea
                className="form-control"
                rows={3}
                placeholder="Enter appointment details or reason..."
                value={appointmentMessage}
                onChange={handleMessageChange}
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">Type:</label>
              <div>
                <div className="form-check">

                  <input
                    className="form-check-input"
                    type="radio"
                    id="inPerson"
                    name="appointmentType"
                    value="IN_PERSON"
                    checked={appointmentType === "IN_PERSON"}
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
                    checked={appointmentType === "VIRTUAL"}
                    onChange={handleAppointmentTypeChange}
                    disabled={!doctor.providesVirtualAppointments}
                  />
                  <label className="form-check-label" htmlFor="virtual">
                    Virtual {!doctor.providesVirtualAppointments && <span className="text-muted">(Not Available)</span>}
                  </label>
                </div>
              </div>
            </div>

            {/* Consultation Type */}
            <div className="mb-4">
              <label className="form-label fw-bold">Consultation:</label>
              <select
                className="form-select"
                value={consultationType}
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
                  checked={needsTranslator}
                  onChange={toggleTranslator}
                />

                <label className="form-check-label fw-bold" 
                htmlFor="needsTranslator">
                  Requires Translator
                </label>

              </div>
              {needsTranslator && (
                <input
                  type="text"
                  className="form-control mt-2"
                  placeholder="Language Required"
                  value={translatorLanguage}
                  onChange={handleTranslatorLanguageChange}
                />
              )
              }

            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={resetForm}>
              Cancel
            </button>
            <button 
              className="btn btn-success" 
              onClick={() => onConfirm(
                selectTimeSlot.date,
                selectTimeSlot.time,
                appointmentMessage,
                appointmentType,
                consultationType,
                needsTranslator,
                translatorLanguage
              )}
              disabled={!appointmentMessage}
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

export default PatientBookingModal;

