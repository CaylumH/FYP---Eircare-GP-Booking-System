import { Link } from "react-router-dom";
import defaultPfp from "../../assets/default_pfp.jpeg";

function DoctorListCard({ doctor }) { //doc card but for displaying in search
    return (
        <div className="w-100" style={{ maxWidth: "720px" }}>
            <div className="card shadow-sm h-100">
                
                <div className="card-body d-flex align-items-start gap-3">

                    <img
                        src={"/api/doctors/" + doctor.id + "/profilePicture"}
                        alt="Doctor"
                        className="rounded-circle border flex-shrink-0"
                        style={{ width: "72px", height: "72px", objectFit: "cover" }}
                        onError={(e) => { e.target.onerror = null; e.target.src = defaultPfp; }}
                    />

                    <div className="d-flex flex-column flex-grow-1">

                        <h5 className="card-title mb-0">{doctor.practiceName}</h5>

                        <p className="text-muted small mb-1">
                            Dr. {doctor.firstName} {doctor.lastName}</p>

                        <p className="card-text text-muted small mb-1">{doctor.practiceAddress}</p>

                        <p className="card-text small mb-3">{doctor.distance} km away</p>

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
