import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import PracticeListCard from "../../components/Doctor/PracticeListCard";
import "../../App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { getToken, getRole } from "../../services/authService";
import { apiRequest } from "../../utils/ApiRequest";
import { useFetchAppointments } from "../../hooks/useFetchAppointments";

function PracticeSearch() {

  const [practices, setPractices] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [maxDistance, setMaxDistance] = useState(500);
  const [takingBookingsOnly, setTakingBookingsOnly] = useState(false);

  const [virtualOnly, setVirtualOnly] = useState(false);
  const [activeTab, setActiveTab] = useState("find");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  const patientId = localStorage.getItem("patientId");
  const { appointments } = useFetchAppointments(patientId, "PATIENT");

  const upcomingAppointments = appointments.filter(appointment =>
    appointment.appointmentStatus === "BOOKED" && new Date(appointment.appointmentEnd) > new Date()
  );

  const [loading, setLoading] = useState(true);
  const token = getToken();

  useEffect(() => {

    const fetchPractices = async () => {

      try {

        const data = await apiRequest("/api/practices/sorted", {
          headers: {
            "Authorization": "Bearer " + token
          }
        });

        setPractices(data ?? []);


        setLoading(false);

      } catch (error) {

        console.error("failed to fetch practices", error);

        alert("Failed to load practices");
        setLoading(false);


      }
    };

    fetchPractices();
  }, []);

  if (!token) return <Navigate to="/" replace />;

  if (getRole() === "ADMIN") return <Navigate to="/admin/dashboard" replace />;

  if (getRole() === "DOCTOR") return <Navigate to="/appointments" replace />;

  if (loading) {

    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-success" role="status" />
        <p className="text-muted mt-3">Finding GP practices near you...</p>
      </div>
    );

  }

  if (practices.length === 0) {

    return <div className="text-center mt-5">No practices available at the moment.</div>;
  }

  const filtered = practices.filter((practice) => {

    const input = searchInput.toLowerCase();
    const search = `${practice.name || ""} ${practice.address || ""}`.toLowerCase();
    if (!search.includes(input)) return false;

    if (practice.distance != null && practice.distance > maxDistance) return false;

    if (takingBookingsOnly && !practice.takingBookings) return false;

    if (virtualOnly && !practice.hasVirtualAppointments) return false;

    return true;

  });

  const totalPages = Math.ceil(filtered.length / pageSize);

  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (

    <div className="container py-4">

      <div className="d-flex justify-content-center gap-2 mb-4">

        <button className={`btn btn-sm ${activeTab === "find"
          ? "btn-success" : "btn-outline-success"}`}
          onClick={() => setActiveTab("find")}>
          Find a Practice
        </button>

        <button className={`btn btn-sm ${activeTab === "upcoming"
          ? "btn-success"
          : "btn-outline-success"}`}
          onClick={() => setActiveTab("upcoming")}>
          Upcoming Appointments {upcomingAppointments.length > 0 && (
            <span className="badge bg-white text-success ms-1">{upcomingAppointments.length}
            </span>

          )}
        </button>

      </div>

      {activeTab === "upcoming" && (
        <div className="d-flex flex-column align-items-center gap-3">
          {upcomingAppointments.length === 0 ? (

            <p className="text-muted">No upcoming appointments.
            </p>
          ) : upcomingAppointments.map((appointment) => (

            <div key={appointment.appointmentId} className="card shadow-sm w-100" style={{ maxWidth: "720px" }}>

              <div className="card-body">

                <div className="fw-semibold">
                  Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                </div>

                <div className="text-muted small mb-1">{appointment.doctor.practice?.name}</div>

                <div className="small">
                  {new Date(appointment.appointmentStart).toLocaleString()}</div>

                <div className="d-flex gap-2 mt-2 flex-wrap">

                  <span className="badge bg-success-subtle text-success-emphasis border border-success-subtle">{appointment.appointmentType}</span>

                  <span className="badge bg-light text-muted border">{appointment.consultationType?.replace(/_/g, " ")}</span>
                </div>
              </div>

            </div>
          )
          )
          }

          <Link to="/patient/appointments" className="btn btn-outline-success btn-sm mt-2">
            Manage all appointments
          </Link>

        </div>
      )
      }

      {activeTab === "find" && <>

        <h2 className="text-center mb-4 fw-bold text-success">

          Find a GP Practice Near You
        </h2>

        <div
          className="mb-3 d-flex flex-column align-items-center gap-3"
          style={{ maxWidth: "520px", margin: "0 auto" }}
        >

          <input
            type="text"
            className="form-control"
            placeholder="Search by practice name or address..."
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); setCurrentPage(1); }}
          />

          {practices.some(practice => practice.distance != null) && (
            <div className="w-100">

              <label className="form-label mb-1 small text-muted">

                Max distance: <strong>{maxDistance} km</strong>
              </label>

              <input
                type="range"
                className="form-range"
                min={0}
                max={500}
                value={maxDistance}
                onChange={(e) => { setMaxDistance(Number(e.target.value)); setCurrentPage(1); }}
              />

            </div>
          )}

          <div className="w-100 d-flex gap-4">

            <div className="form-check">

              <input className="form-check-input" type="checkbox" id="takingBookings"
                checked={takingBookingsOnly}
                onChange={(e) => { setTakingBookingsOnly(e.target.checked); setCurrentPage(1); }} />

              <label className="form-check-label small" htmlFor="takingBookings">Taking bookings

              </label>
            </div>

            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="virtualOnly"
                checked={virtualOnly} onChange={(e) => { setVirtualOnly(e.target.checked); setCurrentPage(1); }} />

              <label className="form-check-label small" htmlFor="virtualOnly">Virtual appointments</label>

            </div>
          </div>

        </div>

        <div className="d-flex flex-column align-items-center gap-4">

          {paginated.map((practice) => (
            <PracticeListCard key={practice.id} practice={practice} />
          ))}

          {totalPages > 1 && (

            <div className="d-flex align-items-center gap-2 mt-2">

              <button className="btn btn-sm btn-outline-secondary"
                onClick={() => setCurrentPage(page => page - 1)}
                disabled={currentPage === 1}>
                Previous
              </button>

              <span className="small text-muted">Page {currentPage} of {totalPages}</span>

              <button className="btn btn-sm btn-outline-secondary"
                onClick={() => setCurrentPage(page => page + 1)}
                disabled={currentPage === totalPages}>
                Next
              </button>

            </div>

          )}

        </div>

      </>}

    </div>

  );
}

export default PracticeSearch;
