package com.example.eircare_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;

import com.example.eircare_backend.model.DoctorAvailability;

public interface DoctorAvailablityRepository extends JpaRepository<DoctorAvailability, Long> {

    DoctorAvailability findByDoctorIdAndDay(Long doctorId, DayOfWeek day);
    List<DoctorAvailability> findByDoctorId(Long doctorId);
    void deleteByDoctorId(Long doctorId);
}

