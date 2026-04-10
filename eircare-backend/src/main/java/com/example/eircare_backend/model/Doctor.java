package com.example.eircare_backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Transient;

@Entity
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "practice_id")

    private Practice practice;

    @Transient
    private String phoneNumber;

    private String firstName;
    private String lastName;
    private String medicalCouncilNumber;
    private Boolean isVerified;
    private String profilePictureUrl;
    private Boolean providesVirtualAppointments;

    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    public Doctor() {
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

    public Practice getPractice() {

        return practice;
    }

    public void setPractice(Practice practice) {
        this.practice = practice;
    }

    public enum Status {
        PENDING,
        APPROVED,
        REJECTED,
        UNCLAIMED
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

    public Boolean getProvidesVirtualAppointments() {
        return providesVirtualAppointments;
    }

    public void setProvidesVirtualAppointments(Boolean providesVirtualAppointments) {
        this.providesVirtualAppointments = providesVirtualAppointments;
    }

    public String getPhoneNumber() {

        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        
        this.phoneNumber = phoneNumber;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }
}
