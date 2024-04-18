import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../utils/ApiRequest";

function DoctorRegister() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        phoneNumber: "",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        medicalCouncilNumber: "",
        providesVirtualAppointments: false,
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            await apiRequest("/api/doctors/claim", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phoneNumber: form.phoneNumber,
                    user: { email: form.email, password: form.password },
                    firstName: form.firstName,
                    lastName: form.lastName,
                    medicalCouncilNumber: form.medicalCouncilNumber,
                    providesVirtualAppointments: form.providesVirtualAppointments,
                })
            });

            navigate("/doctor/pending");

        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="d-flex justify-content-center py-5">

            <div className="card shadow-sm" style={{ width: "100%", maxWidth: "520px" }}>

                <div className="card-header text-center bg-success text-white py-3">
                    <h4 className="mb-0 fw-semibold">GP Registration</h4>
                    <p className="mb-0 small mt-1 opacity-75">Enter your practice phone number to claim your practice</p>
                </div>

                <div className="card-body p-4">

                    <form onSubmit={handleSubmit}>

                        <div className="mb-3">
                            <label className="form-label">Practice Phone Number</label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                className="form-control"
                                placeholder="Input exactly as it is on the HSE GP Website"
                                required
                                value={form.phoneNumber}
                                onChange={handleChange}
                            />
                        </div>

                        <hr />

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    className="form-control"
                                    required
                                    value={form.firstName}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    className="form-control"
                                    required
                                    value={form.lastName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                required
                                value={form.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                className="form-control"
                                minLength="4"
                                maxLength="16"
                                required
                                value={form.password}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Medical Council Number</label>
                            <input
                                type="text"
                                name="medicalCouncilNumber"
                                className="form-control"
                                required
                                value={form.medicalCouncilNumber}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-check mb-4">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                name="providesVirtualAppointments"
                                id="virtualAppts"
                                checked={form.providesVirtualAppointments}
                                onChange={handleChange}
                            />
                            <label className="form-check-label" htmlFor="virtualAppts">
                                Provides virtual appointments
                            </label>
                        </div>

                        <button type="submit" className="btn btn-success w-100" disabled={loading}>
                            {loading ? "Registering..." : "Register"}
                        </button>

                    </form>

                </div>
            </div>
        </div>
    );
}

export default DoctorRegister;
