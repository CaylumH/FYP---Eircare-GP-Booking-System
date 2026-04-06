package com.example.eircare_backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Transient;

@Entity
public class Doctor{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String practiceName;
    private String practiceAddress;
    private String phoneNumber;
    private String firstName;
    private String lastName;
    private String medicalCouncilNumber;
    private Boolean isVerified;
    private String profilePictureUrl;
    private Double latitude;
    private Double longitude;
    private Boolean providesVirtualAppointments;

    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    @Transient
    private Double distance;

    public Doctor() {
    }
    
    public Doctor(Long id, User user, String practiceName, String firstName, String lastName, String phoneNumber, String practiceAddress, String medicalCouncilNumber, Boolean isVerified, Double latitude, Double longitude, Boolean providesVirtualAppointments, Status status) {
        this.id = id;
        this.user = user;
        this.practiceName = practiceName;
        this.practiceAddress = practiceAddress;
        this.phoneNumber = phoneNumber;
        this.firstName = firstName;
        this.lastName = lastName;
        this.medicalCouncilNumber = medicalCouncilNumber;
        this.isVerified = isVerified;
        this.latitude = latitude;
        this.longitude = longitude;
        this.providesVirtualAppointments = providesVirtualAppointments;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getPracticeName() {
        return practiceName;
    }

    public void setPracticeName(String practiceName) {
        this.practiceName = practiceName;
    }

    public enum Status {
        PENDING,
        APPROVED,
        REJECTED
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPracticeAddress() {
        return practiceAddress;
    }

    public void setPracticeAddress(String practiceAddress) {
        this.practiceAddress = practiceAddress;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getMedicalCouncilNumber() {
        return medicalCouncilNumber;
    }

    public void setMedicalCouncilNumber(String medicalCouncilNumber) {
        this.medicalCouncilNumber = medicalCouncilNumber;
    }

    public Boolean getIsVerified() {
        return isVerified;
    }

    public void setIsVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public Double getDistance() {
        return distance;
    }

    public void setDistance(Double distance) {
        this.distance = distance;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Boolean getProvidesVirtualAppointments() {
        return providesVirtualAppointments;
    }

    public void setProvidesVirtualAppointments(Boolean providesVirtualAppointments) {
        this.providesVirtualAppointments = providesVirtualAppointments;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }
}
