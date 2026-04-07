import { useState, useEffect } from "react";
import { fetchWeeklyTimeSlots } from "../services/appointmentService";

export const useWeeklyTimeSlots = (doctorId, weekStartDate, weekEndDate) => {
    //raw from backend
    const [weekTimeSlots, setWeekTimeSlots] = useState([]);

    useEffect(() => {
        
        if (weekStartDate && weekEndDate) {
            const fetchWeekSlots = async () => {

                try {
                    const data = await fetchWeeklyTimeSlots(
                        doctorId, 
                        weekStartDate, 
                        weekEndDate
                    );

                    setWeekTimeSlots(data);
                } catch (error) {
                    console.error(error);
                    alert("Couldn't fetch free appointments: " + error.message);
                }
            };

            fetchWeekSlots();
        }
    }, [doctorId, weekStartDate, weekEndDate]);

    const refetchWeekTimeSlots = async () => {
        try {
            const data = await fetchWeeklyTimeSlots(
                doctorId, 
                weekStartDate, 
                weekEndDate
            );

            setWeekTimeSlots(data);
        } catch (error) {
            console.error(error);
            alert("Couldn't fetch free appointments: " + error.message);
        }
    };

    return { weekTimeSlots, 
        refetchWeekTimeSlots };
};
