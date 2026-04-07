import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import doctorImg from "../assets/doctor-image.jpeg";

function LandingPage() {
    return (
        <div className="bg-light min-vh-100">
            <div className="container py-5">
                <div className="row align-items-center g-4">
                    <div className="col-lg-6">

                        <h1 className="display-5 fw-bold text-dark mb-3">Book local GP appointments without the hassle</h1>

                        <p className="lead text-secondary mb-4">
                            EirCare helps patients find nearby doctors, book appointments quickly, and manage virtual or in-person visits in one place.
                        </p>

                        <div className="d-flex flex-wrap gap-3">

                            <Link to="/patientregister" 
                            className="btn btn-success btn-lg">Book Now</Link>
                            <Link to="/doctorregister" 
                            className="btn btn-outline-success btn-lg">Join as a Doctor</Link>
                        </div>
                    </div>

                    <div className="col-lg-6">

                        <div className="card border-0 shadow-sm overflow-hidden">
                            <img src={doctorImg} 
                            className="img-fluid" 
                            alt="Doctor consultation" />
                        </div>
                    </div>

                </div>
            </div>

            <div className="container pb-5">
                <div className="row g-4">
                    <div className="col-md-4">

                        <div className="card h-100 shadow-sm border-top border-success border-3">
                            <div className="card-body p-4">

                                <h3 className="h5 mb-3">Find a GP</h3>
                                <p className="text-secondary mb-0">Browse available doctors and choose the practice that works best for you.</p>
                            
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card h-100 shadow-sm border-top border-success border-3">
                            <div className="card-body p-4">

                                <h3 className="h5 mb-3">Book in Minutes</h3>
                                <p className="text-secondary mb-0">Reserve a timeslot quickly and include a short message about your symptoms.</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card h-100 shadow-sm border-top border-success border-3">
                            <div className="card-body p-4">
                                
                                <h3 className="h5 mb-3">Join Virtual Visits</h3>
                                <p className="text-secondary mb-0">Attend online consultations through the same booking flow when virtual appointments are available.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>


    );
}

export default LandingPage;