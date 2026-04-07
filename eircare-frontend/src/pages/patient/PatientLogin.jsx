import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../../components/LoginForm";
import { apiRequest } from "../../utils/ApiRequest";

function PatientLogin() {

    const [patientLogin, setPatientLogin] = useState({
        email: "",
        password: ""
    });

    const navigate = useNavigate();
    //const [role, setRole] = useState("");

    //function handleRole(e){
    //    setRole(e.target.value);
    //}

    async function handleLogin(e) {
        e.preventDefault();
        
        const loginData = {
            email: patientLogin.email,
            password: patientLogin.password
        };

        try {

            const userData = await apiRequest("/api/patients/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(loginData)
            });

            localStorage.setItem("token", userData.token);

            localStorage.setItem("patientEmail", userData.patient.user.email);

            localStorage.setItem("patientId", userData.patient.id);

            localStorage.setItem("role", "PATIENT");


            navigate("/dashboard");

        }
        catch (error) {
            alert("Login Failed. Please check email and password.")
            console.error("failed to login", error);
        }
    }


    return (
        <LoginForm
            loginRole="Patient Login"
            loginInput={patientLogin}
            setLoginInput={setPatientLogin}
            onSubmit={handleLogin}
        />); 
}

export default PatientLogin;
