function LoginForm({ loginRole, loginInput, setLoginInput, onSubmit }) {
    
    
    return (
        <div className="d-flex justify-content-center py-5">

            <div className="card shadow-sm" style={{ width: "100%", maxWidth: "440px" }}>

                <div className="card-header text-center bg-success text-white py-3">

                    <h4 className="mb-0 fw-semibold">
                        {loginRole}</h4>

                </div>
                <div className="card-body p-4">

                    <form onSubmit={onSubmit}>

                        <div className="mb-3">

                            <label 
                            className="form-label">Email
                            </label>

                            <input
                            className="form-control"
                            type="email"
                            required
                            value={loginInput.email}

                                onChange={(e) => {

                                    setLoginInput((prev) => (
                                        { ...prev, 
                                            email: e.target.value }
                                        )
                                    )}
                            }

                            />
                        </div>

                        <div className="mb-3">

                            <label className="form-label">
                                Password
                                </label>

                            <input
                                type="password"
                                className="form-control"
                                required
                                title="Password must be between 4 and 16 characters"
                                minLength="4"
                                maxLength="16"
                                value={loginInput.password}

                                onChange={(e) =>
                                    setLoginInput((prev) => ({ ...prev, password: e.target.value }))
                                }

                            />
                        </div>

                        <button type="submit" className="btn btn-success w-100 mt-2">
                            Login
                        </button>
                    </form>
                </div>

            </div>
            
        </div>
    );
}

export default LoginForm;
