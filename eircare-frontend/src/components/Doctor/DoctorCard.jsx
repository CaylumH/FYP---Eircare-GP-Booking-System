import defaultPfp from "../../assets/default_pfp.jpeg";

function DoctorCard({ doctor, id }) {

    if (!doctor) return null;

    return (

        <div className="card shadow-sm rounded-3 mb-4 w-100"
        style={{ maxWidth: "860px" }
        }>
            <div className="card-body p-4">

                <div className="d-flex align-items-center gap-4">

                    <img
                        src={`/api/doctors/${id}/profilePicture`}
                        alt="Doctor"
                        className="rounded-circle border border-2 border-success-subtle flex-shrink-0"
                        style={{ width: "80px", height: "80px", objectFit: "cover" }}
                        onError={(e) => { e.target.onerror = null; e.target.src = defaultPfp; }}
                    />
                    <div>

                        <h5 className="mb-1 fw-semibold text-success">
                            Dr. {doctor.firstName} {doctor.lastName}
                        </h5>

                        <p className="mb-1 fw-medium text-body">
                            {doctor.practiceName}</p>

                        <p className="mb-1 text-muted small">
                            {doctor.practiceAddress}</p>

                        <p className="mb-0 text-muted small">
                            {doctor.phoneNumber}</p>
                    </div>
                </div>

            </div>
        </div>

    );}
export default DoctorCard;
