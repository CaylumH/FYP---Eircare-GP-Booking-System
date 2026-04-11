import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import "../../App.css";
import DoctorListCard from "../../components/Doctor/DoctorListCard";
import { isAuthenticated, getRole, getToken } from "../../services/authService";
import { apiRequest } from "../../utils/ApiRequest";

function PracticePage() {

    const { id: practiceId } = useParams();

    const [practice, setPractice] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchPractice = async () => {

            try {

                const [practiceData, doctorsData] = await Promise.all([
                    apiRequest(`/api/practices/${practiceId}`, {
                        headers: { Authorization: "Bearer " + getToken() }
                    }),
                    apiRequest(`/api/practices/${practiceId}/doctors`, {
                        headers: { Authorization: "Bearer " + getToken() }
                    })
                ]);

                setPractice(practiceData);
                setDoctors(doctorsData.map(doctor => ({ 
                    ...doctor,
                    practice: { ...doctor.practice, distance: practiceData.distance }
                })
            )
        );
                setLoading(false);

            } catch (error) {
                console.error("Failed to load practice", error);
                alert("Failed to load practice");
                setLoading(false);
            }
        };

        fetchPractice();
    }, [practiceId]);

    if (!isAuthenticated()) return <Navigate to="/" replace />;

    if (getRole() === "ADMIN") return <Navigate to="/admin/dashboard" replace />;

    if (getRole() !== "PATIENT") return <Navigate to="/" replace />;

    if (loading) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    if (!practice) {
        return <div className="text-center mt-5">
            Practice not found.</div>;
    }

    return (

        <div className="container py-4 d-flex flex-column align-items-center">

            <div className="card shadow-sm rounded-3 mb-4 w-100" style={{ maxWidth: "860px" }}>
                <div className="card-body p-4">

                    <h4 className="fw-bold text-success mb-1">{practice.name}</h4>

                    <p className="text-muted small mb-1">{practice.address}</p>

                    <p className="text-muted small mb-0">{practice.phoneNumber}</p>

                </div>
            </div>

            <div className="w-100" style={{ maxWidth: "860px" }}>

                <h5 className="fw-semibold mb-3">GPs at this Practice</h5>

                {doctors.length === 0 ? (

                    <p className="text-muted small">No GPs registered at this practice yet.</p>

                ) : (

                    <div className="d-flex flex-column gap-3">
                        {doctors.map(doctor => (
                                <DoctorListCard key={doctor.id} doctor={doctor} />
                            ))}
                    </div>
                )}

            </div>

        </div>

    );
}

export default PracticePage;
