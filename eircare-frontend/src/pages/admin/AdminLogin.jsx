import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../../components/LoginForm";
import { apiRequest } from "../../utils/ApiRequest";

function AdminLogin() {
    const [loginInput, setLoginInput] = useState({ email: "", password: "" });
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();

        try {
            const data = await apiRequest("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginInput),
            }
        );

            localStorage.setItem("token", data.token); //authservice
            localStorage.setItem("role", "ADMIN");

            navigate("/admin/dashboard");
        } catch (error) {
            
            alert("Login failed. Please check your credentials.");
            console.error("Admin login failed", error);
        }
    }

    return (

        
        <LoginForm
            loginRole="Admin Login"
            loginInput={loginInput}
            setLoginInput={setLoginInput}
            onSubmit={handleLogin}
        />
    );
}export default AdminLogin;
