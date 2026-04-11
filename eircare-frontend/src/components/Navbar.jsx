import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout, getRole, isAuthenticated } from "../services/authService";

function NavBar() {

    const role = getRole();
    const navigate = useNavigate();

    const doctorId = localStorage.getItem("doctorId");
    const patientId = localStorage.getItem("patientId");

let homePath = "/";

if (role === "DOCTOR") {
    homePath = "/appointments";
} else if (role === "PATIENT") {
    homePath = "/practices";
} else if (role === "ADMIN") {
    homePath = "/admin/dashboard";
}
    const doctorSettingsPath = doctorId 
    ? `/doctor/settings/${doctorId}` 
    : "/appointments";

    const patientSettingsPath = patientId 
    ? `/patient/settings/${patientId}`
    : "/practices";

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-success px-4">

            <div className="container-fluid">

                <Link to={homePath} className="navbar-brand fw-bold fs-5">
                EirCare
                </Link>

                <div className="ms-auto d-flex gap-3 align-items-center">

                    {isAuthenticated() && role === "DOCTOR" && (
                        <>
                            <Link to="/appointments" 
                            className="nav-link text-white p-0">
                            Appointments
                            </Link>
                            <Link to={doctorSettingsPath} className="nav-link text-white p-0">
                            Settings
                            </Link>

                            <button className="btn btn-outline-light btn-sm" 
                            onClick={() => logout(navigate)}>Logout
                            </button>
                        </>
                    )}
                    {isAuthenticated() && role === "PATIENT" && (
                        <>
                            <Link to="/practices" className="nav-link text-white p-0">
                            Home
                            </Link>

                            <Link to="/patient/appointments" className="nav-link text-white p-0">
                            Appointments
                            </Link>

                            <Link to={patientSettingsPath} className="nav-link text-white p-0">
                            Settings
                            </Link>

                            <button className="btn btn-outline-light btn-sm" 
                            onClick={() => logout(navigate)}
                                >

                            Logout
                            </button>
                        </>
                    )
                    }
                    {isAuthenticated() && role === "ADMIN" && (
                        <>
                            <Link to="/admin/dashboard" 
                            className="nav-link text-white p-0">Dashboard
                            </Link>

                            <button className="btn btn-outline-light btn-sm" 
                            onClick={() => logout(navigate)}>Logout</button>
                        </>
                    )}
                    {!isAuthenticated() && (
                        <>
                            <Link to="/patientlogin" 
                            className="nav-link text-white p-0">
                                Patient Login
                            </Link>

                            <Link to="/doctorlogin" 
                            className="nav-link text-white p-0">
                                Doctor Login</Link>

                            <Link to="/patientregister" 
                            className="btn btn-outline-light btn-sm">
                                Register</Link>
                        </>

                    )}
                </div>
            </div>


        </nav>
    );}

export default NavBar;
