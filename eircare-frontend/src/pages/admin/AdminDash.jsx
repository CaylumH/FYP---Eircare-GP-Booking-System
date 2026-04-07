import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import DoctorCard from "../../components/Doctor/DoctorCard";
import { getToken, getRole } from "../../services/authService";
import { apiRequest } from "../../utils/ApiRequest";

function AdminDash() {
    const [activeTab, setActiveTab] = useState("pendingDoctors");
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const token = getToken();
    const role = getRole();

    useEffect(() => {

        const fetchPendingDoctors = async () => {
            try {
                const data = await apiRequest("/api/admin/doctors/pending", {
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                });

                setPendingDoctors(data);
            } catch (error) {
                console.error("Failed to fetch pending doctors", error);
            }
        };

        const fetchUsers = async () => {
            try {
                const data = await apiRequest("/api/admin/users", {
                    headers: {
                        Authorization: "Bearer " + token,
                    },
                });

                setUsers(data);

            } catch (error) {
                console.error("Failed to fetch users", error);
            }
        };

        const load = async () => {
            await fetchPendingDoctors();
            await fetchUsers();
            setIsLoading(false);
        };
        load();

    }, []);

    async function approveDoctor(doctorId) {
    try {
        await apiRequest(`/api/admin/doctors/${doctorId}/approve`, {
            method: "POST",
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        setPendingDoctors((list) =>
            list.filter((doc) => doc.id !== doctorId)
        );
    } catch (err) {
        console.error("Failed to approve doctor", err);
        alert("Failed to approve doctor");
    }
}

    async function rejectDoctor(doctorId) {
    try {
        await apiRequest(`/api/admin/doctors/${doctorId}/reject`, {
            method: "POST",
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        setPendingDoctors((list) =>
            list.filter((doc) => doc.id !== doctorId)
        );
    } catch (err) {
        console.error("Failed to reject doctor", err);
        alert("Failed to reject doctor");
    }
}


async function deleteUser(userId) {
    const ok = window.confirm("Delete this user? This action cannot be undone.");
    if (!ok) return;

    try {
        await apiRequest(`/api/admin/users/${userId}`, {
            method: "DELETE",
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        setUsers((prevUsers) =>
            prevUsers.filter((u) => u.id !== userId)
        );
    } catch (err) {
        console.error("Failed to delete user", err);
        alert("Failed to delete user");
    }
}
    if (!token || role !== "ADMIN") { //should redirect if not admin
        return <Navigate to="/admin/login" replace />;
    }

    if (isLoading) {
        return <div className="text-center mt-5">Loading...</div>;
    }

return (
    <div className="container py-4">
        <h2 className="fw-bold text-success mb-4">
            Admin Dashboard
        </h2>

        <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
                <button
                    className={`nav-link ${
                        activeTab === "pendingDoctors" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("pendingDoctors")}
                >
                    Pending Doctors
                    {pendingDoctors.length > 0 && (
                        <span className="badge bg-warning text-dark ms-2">
                            {pendingDoctors.length}
                        </span>
                    )}
                </button>
            </li>

            <li className="nav-item">
                <button
                    className={`nav-link ${
                        activeTab === "users" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("users")}
                >
                    Users
                </button>
            </li>
        </ul>

        {activeTab === "pendingDoctors" && (
            <div>
                {pendingDoctors.length === 0 ? (
                    <p className="text-muted">
                        No pending doctor registrations.
                    </p>
                ) : (
                    pendingDoctors.map((doctor) => (
                        <div
                            key={doctor.id}
                            className="d-flex align-items-center gap-3 mb-3"
                        >
                            <div className="flex-grow-1">
                                <DoctorCard
                                    doctor={doctor}
                                    id={doctor.id}
                                />
                            </div>

                            <div className="d-flex flex-column gap-2 flex-shrink-0">
                                <button
                                    className="btn btn-success btn-sm"
                                    onClick={() =>
                                        approveDoctor(doctor.id)
                                    }
                                >
                                    Approve
                                </button>

                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() =>
                                        rejectDoctor(doctor.id)
                                    }
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}

        {activeTab === "users" && (
            <div className="table-responsive">

                <table className="table table-hover align-middle">

                    <thead className="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th></th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>

                                <td className="text-muted small">
                                    {user.id}
                                </td>
                                
                                <td>{user.email}</td>

                                <td>
                                    <span
                                        className={`badge ${
                                            user.role === "ADMIN"
                                                ? "bg-dark"
                                                : user.role === "DOCTOR"
                                                ? "bg-success"
                                                : "bg-secondary"
                                        }`}
                                    >
                                        {user.role}
                                    </span>
                                </td>
                                <td>

                                    <button
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() =>
                                            deleteUser(user.id)
                                        }
                                    >
                                        Delete
                                    </button>

                                </td>
                            </tr>
                        )
                        )}

                    </tbody>

                </table>
            </div>
        )}

    </div>
);

}

export default AdminDash;
