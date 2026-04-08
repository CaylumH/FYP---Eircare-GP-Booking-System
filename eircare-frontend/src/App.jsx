import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from "react";
import { logout } from "./services/authService";
import NavBar from "./components/Navbar";
import DoctorPage from "./pages/doctor/DoctorPage";
import PatientDash from "./pages/patient/PatientDash";
import PatientRegister from "./pages/patient/PatientRegister";
import DoctorRegister from "./pages/doctor/DoctorRegister";
import PatientLogin from "./pages/patient/PatientLogin";
import DoctorLogin from "./pages/doctor/DoctorLogin";
import DoctorBookingManager from "./pages/doctor/DoctorBookingManager";
import PatientBookingManager from "./pages/patient/PatientBookingManager";
import LandingPage from "./pages/LandingPage";
import DoctorSettings from "./pages/doctor/DoctorSettings";
import PatientSettings from "./pages/patient/PatientSettings";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDash from "./pages/admin/AdminDash";
import DoctorPendingPage from "./pages/doctor/DoctorPendingPage";
import Footer from "./components/Footer";
import "bootstrap/dist/css/bootstrap.min.css";



function App() {
  return (
    <BrowserRouter>
    <div className="min-vh-100 d-flex flex-column">

      <NavBar />
      
<div className="container-fluid p-0">

    <Routes>
      <Route path="/" element={<LandingPage />} /> 
      <Route path="/doctorregister" element={<DoctorRegister />} />
      <Route path="/patientregister" element={<PatientRegister />} />
      <Route path="/patientlogin" element={<PatientLogin />} />
      <Route path="/doctorlogin" element={<DoctorLogin />} />
      <Route path="/dashboard" element={<PatientDash />} />
      <Route path="/doctors/:id" element={<DoctorPage />} />
      <Route path="/appointments" element={<DoctorBookingManager />} />
      <Route path="/patient/appointments" element={<PatientBookingManager />} />
      <Route path="/doctor/settings/:id" element={<DoctorSettings />} />
      <Route path="/patient/settings/:id" element={<PatientSettings />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDash />} />
      <Route path="/doctor/pending" element={<DoctorPendingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
</div>
      <Footer />
    </div>
    </BrowserRouter>
  )
}

export default App;
