
function VirtualAppointment({ roomName, closeVirtualAppointmentModal }) {

    //should generate on backend if appointment is virutla
    const virtualmeetinglink = roomName ? `https://meet.jit.si/${roomName}` : null;
console.log("Room code -", roomName);
    
    return (
        <div className="modal d-block" 
        tabIndex="-1"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}

            onClick={closeVirtualAppointmentModal}>

            <div className="modal-dialog modal-xl"

                style={{ maxWidth: "1100px" }}

                onClick={(event) => event.stopPropagation()}>

                <div className="modal-content">

                    <div className="modal-header">

                        <h5 className="modal-title">Video Meeting</h5>

                        <button type="button"
                            className="btn-close"
                            onClick={closeVirtualAppointmentModal}></button>
                    </div>

                    <div className="modal-body p-0" 
                    style={{ height: "75vh" }}
                    >

                        <iframe
                            title="Video Meeting"
                            src={virtualmeetinglink}
                            allow="camera; microphone; fullscreen; display-capture"
                            style={{ width: "100%", 
                                height: "100%",
                                 border: 0 }
                                }
                        />
                    </div>
                </div>

            </div>
        </div>
    );}

    
export default VirtualAppointment;