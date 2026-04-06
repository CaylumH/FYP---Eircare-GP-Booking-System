package com.example.eircare_backend.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Transient;

@Entity
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    
    private Long appointmentId;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Doctor doctor;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Patient patient;

    private LocalDateTime appointmentStart;
    private LocalDateTime appointmentEnd;
    private String appointmentDescription;
    private AppointmentType appointmentType;
    private AppointmentStatus appointmentStatus;
    private Boolean needsTranslator;
    private String translatorLanguage;
    private String roomName;
    private ConsultationType consultationType;

@Transient
    private Integer appointmentDuration;

    public Appointment() {
    }

    public Appointment(Long appointmentId, Doctor doctor, Patient patient, LocalDateTime appointmentStart, LocalDateTime appointmentEnd, String appointmentDescription, AppointmentType appointmentType, AppointmentStatus appointmentStatus, Boolean needsTranslator, String translatorLanguage, String roomName) {
        this.appointmentId = appointmentId;
        this.doctor = doctor;
        this.patient = patient;
        this.appointmentStart = appointmentStart;
        this.appointmentEnd = appointmentEnd;
        this.appointmentDescription = appointmentDescription;
        this.appointmentType = appointmentType;
        this.appointmentStatus = appointmentStatus;
        this.needsTranslator = needsTranslator;
        this.translatorLanguage = translatorLanguage;
        this.roomName = roomName;
    }

    public enum AppointmentStatus {
        BOOKED,
        CANCELLED,
        COMPLETED,
        UNAVAILABLE
    } 

    public enum AppointmentType {
        IN_PERSON,
        VIRTUAL
    }

    public boolean isNeedsTranslator() {
        return needsTranslator != null && needsTranslator;
    }

    public void setNeedsTranslator(Boolean needsTranslator) {
        this.needsTranslator = needsTranslator;
    }

    public String getTranslatorLanguage() {
        return translatorLanguage;
    }

    public void setTranslatorLanguage(String translatorLanguage) {
        this.translatorLanguage = translatorLanguage;
    }

    public Integer getAppointmentDuration() {
        return appointmentDuration;
    }

    public void setAppointmentDuration(Integer appointmentDuration) {
        this.appointmentDuration = appointmentDuration;
    }

    public Long getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
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

    public LocalDateTime getAppointmentStart() {
        return appointmentStart;
    }

    public void setAppointmentStart(LocalDateTime appointmentStart) {
        this.appointmentStart = appointmentStart;
    }

    public LocalDateTime getAppointmentEnd() {
        return appointmentEnd;
    }

    public void setAppointmentEnd(LocalDateTime appointmentEnd) {
        this.appointmentEnd = appointmentEnd;
    }

    public String getAppointmentDescription() {
        return appointmentDescription;
    }

    public void setAppointmentDescription(String appointmentDescription) {
        this.appointmentDescription = appointmentDescription;
    }

    public AppointmentType getAppointmentType() {
        return appointmentType;
    }

    public void setAppointmentType(AppointmentType appointmentType) {
        this.appointmentType = appointmentType;
    }

    public AppointmentStatus getAppointmentStatus() {
        return appointmentStatus;
    }

    public void setAppointmentStatus(AppointmentStatus appointmentStatus) {
        this.appointmentStatus = appointmentStatus;
}

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public ConsultationType getConsultationType() {
        return consultationType;
    }

    public void setConsultationType(ConsultationType consultationType) {
        this.consultationType = consultationType;
    }
}
