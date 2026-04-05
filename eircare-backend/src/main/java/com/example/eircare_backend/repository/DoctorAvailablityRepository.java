package com.example.eircare_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.eircare_backend.model.DoctorAvailability;

public interface DoctorAvailablityRepository extends JpaRepository<DoctorAvailability, Long> {
    DoctorAvailability findByDoctorIdAndDay(Long doctorId, String day);
}

