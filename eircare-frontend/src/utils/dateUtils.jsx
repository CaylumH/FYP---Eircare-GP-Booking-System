import { startOfWeek, endOfWeek, format } from "date-fns";

export const formatDate = (date) => {
    return new Date(date).toDateString();
};

export const calculateWeek = (startDate, setWeekStartDate, setWeekEndDate) => {

    const monday = startOfWeek(new Date(startDate), { weekStartsOn: 1 });

    const sunday = endOfWeek(new Date(startDate), { weekStartsOn: 1 });

    setWeekStartDate(format(monday, "yyyy-MM-dd"));
    
    setWeekEndDate(format(sunday, "yyyy-MM-dd"));
};
