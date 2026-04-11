import defaultPfp from "../../assets/default_pfp.jpeg";

function DoctorProfileImage({ doctorId, size = 72 }) {

    return (
        <img src={`/api/doctors/${doctorId}/profilePicture`}
            alt="Doctor"
            className="rounded-circle border flex-shrink-0"
            style={{ width: `${size}px`, height: `${size}px`, objectFit: "cover" }}
            onError={(e) => { e.target.onerror = null; e.target.src = defaultPfp; }}
        />
    );}

export default DoctorProfileImage;
