import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";

function WeekNavigator({ weekStartDate, weekEndDate, selectedWeekMondayDate, setSelectedWeekMondayDate }) {
    return (
        <div className="d-flex justify-content-between align-items-center">

            <button
             className="btn btn-outline-success nav-btn"
             disabled={!selectedWeekMondayDate}
             onClick={() => {
                const previousWeek = new Date(selectedWeekMondayDate);
                previousWeek.setDate(selectedWeekMondayDate.getDate() - 7);
                setSelectedWeekMondayDate(previousWeek);
            }}
            >
                <ChevronLeft size={18} />
            </button>

            <span className="fw-semibold">
                {weekStartDate} - {weekEndDate}
                </span>

            <button
            className="btn btn-outline-success nav-btn"
            disabled={!selectedWeekMondayDate}
            onClick={() => {
                const nextWeek = new Date(selectedWeekMondayDate);
                nextWeek.setDate(selectedWeekMondayDate.getDate() + 7);
                setSelectedWeekMondayDate(nextWeek);
            }
            }
            >
                <ChevronRight size={18} />
            </button>

        </div>
    );
}

export default WeekNavigator;
