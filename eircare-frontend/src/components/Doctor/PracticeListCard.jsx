import { Link } from "react-router-dom";

function PracticeListCard({ practice }) {
    return (
        <div className="w-100" style={{ maxWidth: "720px" }}>
            <div className="card shadow-sm h-100">

                <div className="card-body d-flex align-items-start gap-3">
                    <div className="d-flex flex-column flex-grow-1">

                        <h5 className="card-title mb-0">{practice.name}</h5>

                        <p className="card-text text-muted small mb-1">{practice.address}</p>

                        <p className="card-text small mb-1">{practice.phoneNumber}</p>
                        <p className="card-text small mb-3">
                            {practice.distance != null ? `${practice.distance} km away` : "Distance unavailable"}
                        </p>

                        <Link
                            to={`/practices/${practice.id}`}
                            className="btn btn-success btn-sm mt-auto align-self-start"
                        >
                            View Practice
                        </Link>

                    </div>

                </div>
            </div>
        </div>
    );
}

export default PracticeListCard;
