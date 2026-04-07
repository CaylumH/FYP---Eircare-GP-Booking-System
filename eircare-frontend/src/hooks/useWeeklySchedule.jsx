import { useState, useEffect } from "react";
import { fetchWeeklyTimeSlots } from "../services/appointmentService";
import { useWeekNavigation } from "./useWeekNavigation";

export const useWeeklySchedule = (doctorId) => {

    const [weekTimeSlots, setWeekTimeSlots] = useState([]);

    const { 
        weekStartDate, 
        weekEndDate, 
        selectedWeekMondayDate, 
        setSelectedWeekMondayDate } = useWeekNavigation();

    useEffect(() => {
        if (weekStartDate && weekEndDate && doctorId) {
            const fetchWeekSlots = async () => {

                try {
                    const data = await fetchWeeklyTimeSlots(doctorId, weekStartDate, weekEndDate);
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
            alert("Couldn't refetch free appointments: " + error.message);
        }
    };

    return { 
        weekTimeSlots, 
        refetchWeekTimeSlots, 
        weekStartDate, 
        weekEndDate, 
        selectedWeekMondayDate, 
        setSelectedWeekMondayDate 
    };
};
