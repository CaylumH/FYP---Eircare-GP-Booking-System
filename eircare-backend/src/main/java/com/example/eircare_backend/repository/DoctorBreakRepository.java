package com.example.eircare_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;

import com.example.eircare_backend.model.DoctorBreak;

public interface DoctorBreakRepository extends JpaRepository<DoctorBreak, Long> {
    List<DoctorBreak> findByDoctorIdAndDay(Long doctorId, DayOfWeek day);
}