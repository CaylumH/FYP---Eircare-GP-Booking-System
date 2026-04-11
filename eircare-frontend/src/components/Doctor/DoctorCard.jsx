import DoctorProfileImage from "./DoctorProfileImage";

function DoctorCard({ doctor, id }) {

    if (!doctor) return null;

    return (

        <div className="card shadow-sm rounded-3 mb-4 w-100"
        style={{ maxWidth: "860px" }
        }>
            <div className="card-body p-4">

                <div className="d-flex align-items-center gap-4">

                    <DoctorProfileImage doctorId={id} size={80} />
                    <div>

                        <h5 className="mb-1 fw-semibold text-success">
                            Dr. {doctor.firstName} {doctor.lastName}
                        </h5>

                        <p className="mb-1 fw-medium text-body">
                            {doctor.practice?.name}</p>

                        <p className="mb-1 text-muted small">
                            {doctor.practice?.address}</p>

                        <p className="mb-0 text-muted small">
                            {doctor.practice?.phoneNumber}</p>
                    </div>
                </div>

            </div>
        </div>

    );}
export default DoctorCard;
