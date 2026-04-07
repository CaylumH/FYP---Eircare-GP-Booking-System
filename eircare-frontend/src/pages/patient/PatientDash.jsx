import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navigate } from "react-router-dom";
import DoctorListCard from "../../components/Doctor/DoctorListCard";
import "../../App.css"; 
import "bootstrap/dist/css/bootstrap.min.css";
import { getToken, getRole } from "../../services/authService";
import { apiRequest } from "../../utils/ApiRequest";

function PatientDash() {

  const [sortedDoctors, setDoctors] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [virtualOnly, setVirtualOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState(100); //might split
  const [loading, setLoading] = useState(true);
  const token = getToken();


  useEffect(() => {

    const fetchDoctors = async () => {

      try{

      const token = getToken();

      const data = await apiRequest("/api/doctors/sorted", {
        headers: {
          "Authorization": "Bearer " + token
        }


      });

      setDoctors(data);

      let maxDist;

      if (data.length > 0) {
        maxDist = Math.ceil(Math.max(...data.map(d => d.distance ?? 0)));
        setMaxDistance(maxDist);
      }
      setLoading(false);
    }
    catch(error){
        console.error("failed to fetch doctors", error);
        alert("Failed to load doctors");

        setLoading(false);
    }
    };

    fetchDoctors();
  }, 
  []);

  if (!token) return <Navigate to="/" replace />;

  if (getRole() === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
  if (getRole() === "DOCTOR") return <Navigate to="/appointments" replace />;

  if (loading === true) {

    return <div className="text-center mt-5">Loading...</div>;
  }

  if (sortedDoctors.length === 0) {
    return <div className="text-center mt-5">No doctors available at the moment.
    </div>;
  }

  return (

    <div className="container py-4">

      <h2 className="text-center mb-4 fw-bold text-success">
        Find a GP Near You
        </h2>

      <div 
      className="mb-3 d-flex flex-column align-items-center gap-3" 
      style={{ maxWidth: "520px", margin: "0 auto" }}
      >

        <input
          type="text"
          className="form-control"
          placeholder="Search by name, practice, or medical council number..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        <div className="w-100">
          <label className="form-label mb-1 small text-muted">
            Max distance: <strong>{maxDistance} km</strong>
          </label>

          <input
            type="range"
            className="form-range"
            min={0}
            max={Math.ceil(
              Math.max(...sortedDoctors.map(d => d.distance ?? 0))
            )}
            value={maxDistance}
            onChange={(e) => setMaxDistance(Number(e.target.value))}
          />
        </div>

        <div className="form-check align-self-start">
          <input
            type="checkbox"
            className="form-check-input"
            id="virtualOnly"
            checked={virtualOnly}
            onChange={(e) => setVirtualOnly(e.target.checked)}
          />
          <label className="form-check-label small" htmlFor="virtualOnly">
            Virtual appointments only
          </label>
        </div>
      </div>

      <div className="d-flex flex-column align-items-center gap-4">

        {sortedDoctors.filter((doctor) => {

          const input = searchInput.toLowerCase();

          const search = 
          `${doctor.firstName || ""} ${doctor.lastName || ""} ${doctor.practiceName || ""} ${doctor.medicalCouncilNumber || ""}`.toLowerCase();
          if (!search.includes(input)) return false;

          if (virtualOnly && !doctor.providesVirtualAppointments) return false;

          if (doctor.distance != null && doctor.distance > maxDistance) return false;
          
          return true;

        }).map((doctor) => (
          <DoctorListCard key={doctor.id} doctor={doctor} />
        ))}

      </div>

    </div>

  );
}

export default PatientDash;

