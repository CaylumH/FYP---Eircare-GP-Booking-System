import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getToken } from "../../services/authService";
import { apiRequest } from "../../utils/ApiRequest";
import { useFetchUserDetails } from "../../hooks/useFetchUserDetails";

function DoctorSettings() {
    const { id: doctorId } = useParams();
    const { userDetails } = useFetchUserDetails(doctorId, "DOCTOR");
    const [doctorSettings, setDoctorSettings] = useState({
        firstName: "",
        lastName: "",
        email: "",
        practiceName: "",
        practiceAddress: "",
        medicalCouncilNumber: "",
        phoneNumber: "",
        streetName: "",
        city: "",
        county: "",
        country: "",
        profilePicture: null,
        providesVirtualAppointments: false,
    });
//populate form from fetched details
    useEffect(() => {
        if (userDetails) {
            setDoctorSettings((prev) => ({
                ...prev,
                firstName: userDetails.firstName ?? "",
                lastName: userDetails.lastName ?? "",
                email: userDetails.user?.email ?? "",
                phoneNumber: userDetails.phoneNumber ?? "",
                practiceAddress: userDetails.practiceAddress ?? "",
                practiceName: userDetails.practiceName ?? "",
                medicalCouncilNumber: userDetails.medicalCouncilNumber ?? "",
                providesVirtualAppointments: userDetails.providesVirtualAppointments ?? false,
            }
        ));
        }
    }, [userDetails]);

    function handleProfilePictureChange(e) {

        const pfp = e.target.files[0];
        setDoctorSettings((prev) => ({ 
            ...prev, profilePicture: pfp 
        }));
    }

    async function uploadProfilePicture() {

        if (!doctorSettings.profilePicture) {
            alert("Please upload an image first");
            return;
        }

        const formData = new FormData();
        formData.append("profilePicture", doctorSettings.profilePicture);

        try {
            await apiRequest(`/api/doctors/uploadProfilePicture?doctorId=${doctorId}`, {
                method: "POST",
                headers: {
                     "Authorization": `Bearer ${getToken()}` },
                body: formData
            });

            alert("Profile picture updated!");
        } catch (error) {
            console.error("Error uploading pfp", error);
            alert("Error uploading pfp");
        }
    }

    async function handleUpdateDetails(e) {
        e.preventDefault();

        const addressDetails = [doctorSettings.streetName, 
            doctorSettings.city, 
            doctorSettings.county, 
            doctorSettings.country];

        const addressInputBoolean = addressDetails.some((value) => value.trim() !== "");

        let fullAddress = doctorSettings.practiceAddress;

        if (addressInputBoolean) {

            if (addressDetails.some((value) => value.trim() === "")) {

                alert("Please fill in all address fields to update address");
                return;
            }

            fullAddress = `${doctorSettings.streetName.trim()}, ${doctorSettings.city.trim()}, ${doctorSettings.county.trim()}, Ireland`;
        }

        try {
            await apiRequest(`/api/doctors/${doctorId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                    user: { email: doctorSettings.email },
                    firstName: doctorSettings.firstName,
                    lastName: doctorSettings.lastName,
                    phoneNumber: doctorSettings.phoneNumber,
                    practiceName: doctorSettings.practiceName,
                    medicalCouncilNumber: doctorSettings.medicalCouncilNumber,
                    practiceAddress: fullAddress,
                    providesVirtualAppointments: doctorSettings.providesVirtualAppointments
                })
            }
        );

            setDoctorSettings((prev) => ({
                ...prev,
                practiceAddress: fullAddress,
                streetName: "",
                city: "",
                county: "",
                country: "",
            }));
            alert("Details updated successfully");
        } catch (error) {
            console.error("couldn't update details", error);
            alert("Failed to update details");
        }
    }

    return (
        <div className="d-flex justify-content-center py-5">

            <div className="card shadow-sm" style={{ width: "100%", maxWidth: "580px" }}>

                <div className="card-header text-center bg-success text-white py-3">

                    <h4 className="mb-0 fw-semibold">Doctor Settings</h4>
                </div>

                <div className="card-body p-4">

                    <form onSubmit={handleUpdateDetails}>

                        <div className="mb-3">

                            <label className="form-label">Profile Picture</label>

                            <div className="d-flex gap-2 align-items-center">
                                <input
                                    onChange={handleProfilePictureChange}
                                    className="form-control"
                                    type="file"
                                    accept="image/*"
                                />
                                <button
                                    type="button"
                                    onClick={uploadProfilePicture}
                                    className="btn btn-outline-success flex-shrink-0"
                                >
                                    Upload
                                </button>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input
                                value={doctorSettings.email}
                                onChange={(e) => 
                                    setDoctorSettings((prev) => ({ ...prev, email: e.target.value })
                                )}
                                type="email"
                                className="form-control"
                            />
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">First Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={doctorSettings.firstName}
                                    onChange={(e) => 
                                        setDoctorSettings((prev) => ({ ...prev, firstName: e.target.value }))}
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Last Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={doctorSettings.lastName}
                                    onChange={(e) => 
                                        setDoctorSettings((prev) => ({ ...prev, lastName: e.target.value }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Phone Number</label>
                            <input
                                type="text"
                                className="form-control"
                                value={doctorSettings.phoneNumber}
                                onChange={(e) => setDoctorSettings((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                            />
                        </div>

                        <div className="mb-3 form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="providesVirtual"
                                checked={doctorSettings.providesVirtualAppointments}
                                onChange={(e) => 
                                    setDoctorSettings((prev) => ({ 
                                        ...prev, 
                                        providesVirtualAppointments: 
                                        e.target.checked }
                                    ))
                                }
                            />
                            <label className="form-check-label" htmlFor="providesVirtual">
                                Offer Virtual Appointments
                            </label>

                        </div>

                        <div className="mb-3">

                            <label className="form-label">Current Address</label>

                            <div className="p-2 border rounded bg-light">{doctorSettings.practiceAddress}</div>
                        </div>

                        <h5 className="mb-3">Update Address</h5>

                        <div className="row">

                            <div className="col-md-6 mb-3">

                                <label className="form-label">Street Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={doctorSettings.streetName}
                                    onChange={(e) => setDoctorSettings((prev) => ({ ...prev, streetName: e.target.value }))
                                }
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">City</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={doctorSettings.city}
                                    onChange={(e) => 
                                        setDoctorSettings((prev) => ({ ...prev, city: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">County</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={doctorSettings.county}
                                    onChange={(e) => 
                                        setDoctorSettings((prev) => ({ ...prev, county: e.target.value }

                                        ))}
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Country</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={doctorSettings.country}
                                    onChange={(e) => setDoctorSettings((prev) => (
                                        { ...prev, country: e.target.value }
                                    ))}
                                />
                            </div>

                        </div>

                        <button type="submit" className="btn btn-success w-100 mt-2">
                            Update Details
                        </button>

                    </form>

                </div>
            </div>
        </div>
        
    );
}

export default DoctorSettings;
