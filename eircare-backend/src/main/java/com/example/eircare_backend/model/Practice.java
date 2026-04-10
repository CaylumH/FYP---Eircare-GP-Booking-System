package com.example.eircare_backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Transient;

@Entity
public class Practice{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String address;
    private String phoneNumber;

    private Double latitude;
    private Double longitude;

    @Enumerated(EnumType.STRING)
    private Status status = Status.UNCLAIMED;

    @Transient
    private Double distance;

    @Transient
    private boolean takingBookings;

    @Transient
    private boolean hasVirtualAppointments;

    public Practice() {
    }

    public enum Status {
        UNCLAIMED,
        CLAIMED
    }

    public Long getId() {

        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {

        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhoneNumber() {

        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
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

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
        
    }

    public Double getDistance() {
        return distance;
    }

    public void setDistance(Double distance) {
        this.distance = distance;

    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        
        this.status = status;
    }

    public boolean isTakingBookings() {
        return takingBookings;

    }

    public void setTakingBookings(boolean takingBookings) {


        this.takingBookings = takingBookings;
    }

    public boolean isHasVirtualAppointments() {
        return hasVirtualAppointments;
    }

    public void setHasVirtualAppointments(boolean hasVirtualAppointments) {

        this.hasVirtualAppointments = hasVirtualAppointments;
    }
}
