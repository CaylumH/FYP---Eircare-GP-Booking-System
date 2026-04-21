import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getToken } from "../../services/authService";
import { apiRequest } from "../../utils/ApiRequest";
import { useFetchUserDetails } from "../../hooks/useFetchUserDetails";

function PatientSettings() {
    const { id: patientId } = useParams();
    const { userDetails } = useFetchUserDetails(patientId, "PATIENT");

    const [address, setAddress] = useState("");

    const [patientSettings, setPatientSettings] = useState(
        {
            email: "",
            firstName: "",
            lastName: "",
            phoneNumber: "",
            streetName: "",
            city: "",
            county: "",
            country: "Ireland"
        }
    );

    useEffect(() => {

        if (userDetails) {
            setPatientSettings((prev) => ({
                //dont overrite with emtpy strings
                ...prev,
                email: userDetails.user?.email || "",
                firstName: userDetails.firstName || "",
                lastName: userDetails.lastName || "",
                phoneNumber: userDetails.phoneNumber || ""
            }
            )
            );
            setAddress(userDetails.address);
        }
    }, [userDetails]);

    async function handleUpdateDetails(e) {

        e.preventDefault();

        const addressFields = [patientSettings.streetName, patientSettings.city, patientSettings.county];
        const hasAddressInput = addressFields.some((value) => value.trim() !== "");

        let fullAddress = address;

        if (hasAddressInput) {
            if (addressFields.some((value) => value.trim() === "")) {
                alert("Fill in all address fields to update address.");
                return;
            }

            fullAddress = `${patientSettings.streetName.trim()}, ${patientSettings.city.trim()}, ${patientSettings.county.trim()}, ${patientSettings.country.trim()}`;
        }

        try {

            
            await apiRequest(`/api/patients/${patientId}`, {
                method: "PUT",
                headers:
                {

                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`
                },


                body: JSON.stringify({
                    user: { email: patientSettings.email },
                    firstName: patientSettings.firstName,
                    lastName: patientSettings.lastName,
                    phoneNumber: patientSettings.phoneNumber,
                    address: fullAddress
                })
            });

            setAddress(fullAddress);

            setPatientSettings((prev) => ({
                ...prev,
                streetName: "",
                city: "",
                county: "",
                country: "Ireland"
            }
            )
            );
            alert("Details updated!");

        } catch (error) {

            console.error("Error updating patient details", error);
            alert("Error updating details");
        }
    }

    return (
        <div className="d-flex justify-content-center py-5 ">

            <div className="card shadow-sm" style={{ width: "100%", maxWidth: "580px" }}>

                <div className="card-header text-center bg-success text-white py-3">
                    <h4 className="mb-0 fw-semibold">Patient Settings</h4>
                </div>

                <div className="card-body p-4">
                    <form onSubmit={handleUpdateDetails}>

                        <div className="mb-3 ">
                            <label className="form-label">Email:</label>
                            <input
                                value={patientSettings.email}
                                required
                                className="form-control"
                                type="email"
                                onChange={(e) => setPatientSettings((prev) => ({ ...prev, email: e.target.value }))}
                            />
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">First Name:</label>
                                <input type="text" className="form-control"
                                    value={patientSettings.firstName}
                                    required
                                    onChange={(e) => setPatientSettings((prev) => ({ ...prev, firstName: e.target.value }))} />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Last Name:</label>
                                <input type="text"
                                    className="form-control"
                                    value={patientSettings.lastName}
                                    onChange={(e) => setPatientSettings((prev) => ({ ...prev, lastName: e.target.value })
                                    )} required />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Phone Number:</label>
                            <input type="tel"
                                className="form-control"
                                minLength="6"
                                maxLength="14"
                                value={patientSettings.phoneNumber}
                                onChange={(e) => setPatientSettings((prev) => ({ ...prev, phoneNumber: e.target.value }))} required />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Current Address:</label>
                            <div className="p-2 border rounded bg-light">{address}</div>
                        </div>

                        <h5 className="mt-4 mb-3">Address</h5>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Street Name:</label>
                                <input type="text"
                                    className="form-control"
                                    value={patientSettings.streetName}
                                    onChange={(e) => setPatientSettings((prev) => ({ ...prev, streetName: e.target.value })
                                    )} />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">City/Town:</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    value={patientSettings.city}
                                    onChange={(e) => setPatientSettings((prev) => ({ ...prev, city: e.target.value })
                                    )} />
                            </div>

                        </div>
                        <div className="row">

                            <div className="col-md-6 mb-3">
                                <label className="form-label">County:</label>
                                <input type="text"
                                    className="form-control"
                                    value={patientSettings.county}
                                    onChange={(e) => setPatientSettings((prev) => ({ ...prev, county: e.target.value }))}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Country:</label>
                                <input type="text"
                                    className="form-control"
                                    value={patientSettings.country}
                                    readOnly />
                            </div>
                        </div>

                        <div>
                            <button
                                className="btn btn-success mt-3"
                                type="submit"
                            >Update Details</button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
} export default PatientSettings;
