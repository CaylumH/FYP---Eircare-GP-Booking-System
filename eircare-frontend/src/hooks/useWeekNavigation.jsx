import { useState, useEffect } from "react";
import { calculateWeek } from "../utils/dateUtils";

export const useWeekNavigation = () => {

    const [weekStartDate, setWeekStartDate] = useState(null);
    const [weekEndDate, setWeekEndDate] = useState(null);
    const [selectedWeekMondayDate, setSelectedWeekMondayDate] = useState(null);

    useEffect(() => {

        const today = new Date();

        calculateWeek(today, setWeekStartDate, setWeekEndDate);

        setSelectedWeekMondayDate(today);
    }, []);

    useEffect(() => {

        if (selectedWeekMondayDate) {
            calculateWeek(selectedWeekMondayDate, setWeekStartDate, setWeekEndDate);
        }
    }, [selectedWeekMondayDate]);

    return {
        weekStartDate,
        weekEndDate,
        selectedWeekMondayDate,
        setSelectedWeekMondayDate,
    };
    
};
