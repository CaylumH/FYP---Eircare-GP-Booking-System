import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../utils/ApiRequest";

function PatientRegister() {

    const [patientRegister, setPatientRegister] = useState({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        streetName: "",
        city: "",
        county: "",
        country: ""
    });

    async function handleRegister(e) {
        e.preventDefault();

        //TODO: add fallback for if nominatim fails to find address
        const fullAddress = `${patientRegister.streetName}, ${patientRegister.city}, ${patientRegister.county}, ${patientRegister.country}`;


        try {

            const patientRegisterData = {

                user: {
                    email: patientRegister.email.trim(),
                    password: patientRegister.password,
                    role: "PATIENT"
                },

                firstName: patientRegister.firstName.trim(),
                lastName: patientRegister.lastName.trim(),
                phoneNumber: patientRegister.phoneNumber.trim(),

                //backend expects full address. I could change to individual fieldns

                address: fullAddress
            };

            const userData = await apiRequest("/api/patients/register", {

                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(patientRegisterData)


            });

            //localStorage.setItem("token", userData.token);
            localStorage.setItem("patientEmail", userData.user.email);

            alert("Account Registered. Time to Log in!!!")

        }
        catch (error) {
            alert("Registration Failed:" + error.message);
            console.error("Failed to register", error);
        }
    }


    return (
        <div className="d-flex justify-content-center py-5">

            <div className="card shadow-sm" style={{ width: "100%", maxWidth: "580px" }}>

                <div className="card-header text-center bg-success text-white py-3">
                    <h4 className="mb-0 fw-semibold">Patient Registration</h4>
                </div>

                <div className="card-body p-4">

                    <form onSubmit={handleRegister}>

                        <div className="mb-3 ">

                            <label className="form-label">Email:</label>

                            <input
                                value={patientRegister.email}
                                required
                                className="form-control"
                                type="email"
                                onChange={(e) => setPatientRegister((prev) => ({ ...prev, email: e.target.value }))
                            }
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Password:</label>
                            <input type="password"
                                className="form-control"
                                minLength="4"
                                maxLength="16"
                                required
                                title="Password must be between 4 and 16 characters"
                                value={patientRegister.password}
                                onChange={(e) =>
                                    setPatientRegister((prev) => ({ ...prev, password: e.target.value }

                                    )
                                    )
                                } />
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">

                                <label className="form-label">First Name:</label>
                                <input type="text" 
                                className="form-control"
                                    required
                                    value={patientRegister.firstName}
                                    onChange={(e) => setPatientRegister((prev) => ({ ...prev, firstName: e.target.value }))
                                    } 
                                    />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Last Name:</label>

                                <input 
                                type="text"
                                    className="form-control"
                                    value={patientRegister.lastName}
                                    onChange={(e) => 
                                        setPatientRegister((prev) => ({ ...prev, lastName: e.target.value })
                                    )
                                    } required />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Phone Number:</label>
                            <input
                                className="form-control"
                                type="tel"
                                value={patientRegister.phoneNumber}
                                minLength="6"
                                maxLength="14"
                                onChange={(e) => setPatientRegister((prev) => ({ ...prev, phoneNumber: e.target.value })
                            )}
                                 required />
                        </div>

                        <h5 className="mt-4 mb-3">Address</h5>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Street Name:</label>
                                <input type="text"
                                    className="form-control"
                                    value={patientRegister.streetName}
                                    onChange={(e) => setPatientRegister((prev) => ({ ...prev, streetName: e.target.value })
                                    )}
                                    required />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">City/Town:</label>
                                <input type="text"
                                    className="form-control"
                                    value={patientRegister.city}
                                    onChange={(e) => setPatientRegister((prev) => ({ ...prev, city: e.target.value })
                                    )} required />
                            </div>

                        </div>
                        <div className="row">

                            <div className="col-md-6 mb-3">
                                <label className="form-label">County:</label>
                                <input type="text"
                                    className="form-control"
                                    value={patientRegister.county}
                                    onChange={(e) => setPatientRegister((prev) => ({ ...prev, county: e.target.value }))} required />
                            </div>

                            <div className="col-md-6 mb-3">

                                <label className="form-label">Country:</label>

                                <input
                                    type="text"
                                    className="form-control"
                                    value={patientRegister.country}
                                    onChange={(e) => setPatientRegister((prev) => ({ ...prev, country: e.target.value }))} required />
                            </div>
                        </div>

                        <div>
                            <button
                                className="btn btn-success mt-3"
                                type="submit"
                            >Register</button>
                        </div>
                    </form>

                    <div className="d-flex justify-content-center mt-4 gap-3">
                        <Link to="/patientlogin" className="btn btn-outline-success">Patient Login</Link>
                        <Link to="/doctorregister" className="btn btn-outline-success">Doctor Register</Link>
                    </div>
                </div>

            </div>

        </div>
    );

}

export default PatientRegister;
