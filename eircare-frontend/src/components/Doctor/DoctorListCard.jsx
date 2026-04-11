import { Link } from "react-router-dom";
import DoctorProfileImage from "./DoctorProfileImage";

function DoctorListCard({ doctor }) { //doc card but for displaying in search
    return (
        <div className="w-100" style={{ maxWidth: "720px" }}>
            <div className="card shadow-sm h-100">

                <div className="card-body d-flex align-items-start gap-3">

                    <DoctorProfileImage doctorId={doctor.id} />

                    <div className="d-flex flex-column flex-grow-1">

                        <h5 className="card-title mb-0">{doctor.practice?.name}</h5>

                        <p className="text-muted small mb-1">
                            Dr. {doctor.firstName} {doctor.lastName}</p>

                        <p className="card-text text-muted small mb-1">{doctor.practice?.address}</p>

                        <p className="card-text small mb-3">
                            {doctor.practice?.distance != null 
                            ? `${doctor.practice.distance} km away` 
                            : "Distance unavailable"}
                        </p>

                        {doctor.providesVirtualAppointments && (
                            <span className="badge bg-success-subtle text-success-emphasis border border-success-subtle mb-2">Virtual appointments available</span>
                        )}

                        <Link
                         to={`/doctors/${doctor.id}`} 
                         className="btn btn-success btn-sm mt-auto align-self-start"
                         >
                            View GP
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );

}

export default DoctorListCard;
