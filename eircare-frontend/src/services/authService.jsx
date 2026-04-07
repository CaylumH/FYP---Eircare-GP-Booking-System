export const getToken = () => {

    return localStorage.getItem("token");
};

export const getRole = () => {
    return localStorage.getItem("role");
};

export const isAuthenticated = () => {

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    return !!(token && role);

};

export const logout = (navigate) => {

    localStorage.removeItem("token");
    localStorage.removeItem("doctorEmail");
    localStorage.removeItem("doctorId");
    localStorage.removeItem("patientEmail");
    localStorage.removeItem("patientId");
    localStorage.removeItem("role");

    if (navigate) {
        navigate("/");
    }
};
