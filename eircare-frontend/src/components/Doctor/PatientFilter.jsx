function PatientFilter({
    patients,
    searchInput,
    setSearchInput,
    searchedPatientId,
    setSearchedPatientId
})
{
    const selectedPatient = (patients ?? []).find(
        (p) => String(p.id) === String(searchedPatientId)
    );
let searchedPatients = [];

if (searchInput) {

    const searchInputLower = searchInput.toLowerCase();

    searchedPatients = (patients ?? []).filter((patient) => {

        const first = patient.firstName ?
         patient.firstName.toLowerCase() :
          "";

        const last = patient.lastName ?
         patient.lastName.toLowerCase() :
          "";
        const email = patient.user?.email ? 
        patient.user.email.toLowerCase() :
         "";

        return (
            first.includes(searchInputLower) ||
            last.includes(searchInputLower) ||
            email.includes(searchInputLower)
        );
    }
);
}
    return (

        <div>

            <input
                type="text"
                className="form-control"
                placeholder="Search for patient"
                value={searchInput}
                onChange={(e) => {
                    setSearchInput(e.target.value);
                    setSearchedPatientId("");
                }}
            />

            {selectedPatient && (
                <div className="d-flex align-items-center gap-2 mt-2">

                    <span className="badge bg-primary"
                        style={{ fontSize: "0.85rem" }}
                        >
                        {selectedPatient.firstName} {selectedPatient.lastName}
                    </span>

                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => { setSearchInput(""); setSearchedPatientId(""); }}
                    >
                        Clear
                    </button>
                </div>
            )}

            {searchInput && (
                <div
                    className="border rounded mt-1"
                    style={
                        { overflowY:
                             "scroll", height:
                              "150px" }}
                >
                    {searchedPatients.length > 0 ? (

                        searchedPatients.map((patient) => (

                            <button
                                key={patient.id}
                                type="button"
                                className="btn btn-light w-100 text-start border-bottom rounded-0 py-2 px-3"
                                onClick={() => {


                                    setSearchedPatientId(patient.id);
                                    setSearchInput("");
                                }}
                            >
                                <div>{patient.firstName} {patient.lastName}</div>
                                
                                <div 
                                className="text-muted small">{patient.user?.email}
                                </div>
                            </button>
                        ))
                    ) : (
                        <p className="text-muted small p-2 mb-0">No patients found</p>
                    )}
                </div>
            )}

        </div>
    )

}
export default PatientFilter;