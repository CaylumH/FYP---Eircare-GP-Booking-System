import { useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../services/authService";

function DoctorPendingPage() {

const routeState = useLocation();
const navigate = useNavigate();

//shwo rejected or pending
const isRejected = routeState.state?.denied === true;

return (
    <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
    >
        <div
            className="card shadow-sm p-5 text-center"
            style={{ maxWidth: "480px", width: "100%" }}
        >

            {isRejected ? (
                <>
                    <div className="mb-3 text-danger fs-1">✕</div>

                    <h4 className="fw-bold text-danger mb-3">
                        Application Denied
                    </h4>

                    <p className="text-muted">
                        Your registration was reviewed but not approved.
                    </p>
                </>
            ) : (
                <>
                    <div className="mb-3 text-warning fs-1">⏳</div>

                    <h4 className="fw-bold mb-3">
                        Pending Approval
                    </h4>

                    <p className="text-muted">
                        Your account is still under review by an admin.
                        Please check back soon...
                    </p>
                </>
            )}

            <button
                className="btn btn-outline-secondary mt-3"
                onClick={() => logout(navigate)}
            >
                Back to Home
            </button>

        </div>
    </div>
);

}

export default DoctorPendingPage;