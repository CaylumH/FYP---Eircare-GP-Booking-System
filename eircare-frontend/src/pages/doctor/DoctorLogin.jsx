import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../../components/LoginForm";
import { apiRequest } from "../../utils/ApiRequest";

const DoctorLogin = () => 
{

    const [doctorLogin, setDoctorLogin] = useState(
        {
        email: "",
        password: ""
    }
);

    const navigate = useNavigate();
    //const [role, setRole] = useState("");

    async function handleLogin(e) {

        e.preventDefault();

        const login = {

            email: doctorLogin.email,
            password: doctorLogin.password
        };

        try {
            const response = await apiRequest("/api/doctors/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(login)
            }
        );

        
            localStorage.setItem("token", response.token);
            localStorage.setItem("doctorEmail", response.doctor.user.email);
            localStorage.setItem("doctorId", response.doctor.id);
            localStorage.setItem("role", "DOCTOR");

            navigate("/appointments");

        } catch (error) {
            if (error.message === "ACCOUNT_PENDING") {
                navigate("/doctor/pending");
            } else if (error.message === "ACCOUNT_REJECTED") {
                navigate("/doctor/pending", { state: { denied: true } });
            } else {
                alert("Login Failed. Please check email and password.");
                console.error("Failed to login doctor:", error);
            }
        }}


    return(
        <LoginForm
            loginRole="Doctor Login"
            loginInput={doctorLogin}
            setLoginInput={setDoctorLogin}
            onSubmit={handleLogin}
        />
    );
}



export default DoctorLogin;
