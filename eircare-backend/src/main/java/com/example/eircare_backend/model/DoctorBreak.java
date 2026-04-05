package com.example.eircare_backend.model;

import java.time.DayOfWeek;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class DoctorBreak {
    
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

private Long doctorId;
    private DayOfWeek day;
    private String breakStart;
    private String breakEnd;

    public DoctorBreak() {
    }

    public DoctorBreak(Long id, Long doctorId, DayOfWeek day, String breakStart, String breakEnd) {
        this.id = id;
        this.doctorId = doctorId;
        this.day = day;
        this.breakStart = breakStart;
        this.breakEnd = breakEnd;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public DayOfWeek getDay() {
        return day;
    }

    public void setDay(DayOfWeek day) {
        this.day = day;
    }

    public String getBreakStart() {
        return breakStart;
    }

    public void setBreakStart(String breakStart) {
        this.breakStart = breakStart;
    }

    public String getBreakEnd() {
        return breakEnd;
    }

    public void setBreakEnd(String breakEnd) {
        this.breakEnd = breakEnd;
    }
}