import { useState, useEffect } from "react";
import { getToken } from "../services/authService";
import { apiRequest } from "../utils/ApiRequest";

export const useFetchUserDetails = (userId, userType) => {

    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchUserDetails = async () => {

            try {
                let endpoint;

                if (userType === "DOCTOR") {
                endpoint = "/api/doctors/" + userId;
            } else {
                endpoint = "/api/patients/" + userId;
            }

                const userDetailsJson = await apiRequest(endpoint, {

                    method: "GET",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${getToken()}`
                    }

                });

                setUserDetails(userDetailsJson);
                setLoading(false);

            }
            catch (error) {
console.error(
                "Error fetching " + userType.toLowerCase() + " details",
                error
);
                setLoading(false);
            }
        };

        if (userId) {
            fetchUserDetails();
        }
    },[userId, userType]);

    return { userDetails,
         loading };
};
