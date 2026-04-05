package com.example.eircare_backend;

import com.example.eircare_backend.model.Doctor;
import com.example.eircare_backend.model.Patient;

public class LoginResponse {
    private String token;
    private Patient patient;
    private Doctor doctor;

    public LoginResponse(String token, Patient patient) {
        this.token = token;
        this.patient = patient;
    }

    public LoginResponse(String token, Doctor doctor) {
        this.token = token;
        this.doctor = doctor;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }
}
