package com.example.eircare_backend.repository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.eircare_backend.model.Appointment;


public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByDoctorId(Long doctorId);

    List<Appointment> findByPatientId(Long patientId);

    boolean existsByDoctorIdAndAppointmentStart(Long doctorId, LocalDateTime appointmentStart);

    @Query ("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND DATE(a.appointmentStart) = :date")
    List<Appointment> findByDoctorIdAndAppointmentDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentStart >= :startDate AND a.appointmentStart < :endDate")
    List<Appointment> findByDoctorIdAndWeekStartAndWeekEnd(@Param ("doctorId") Long doctorId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId " +
           "AND a.appointmentStatus NOT IN :statusExcluded " +
           "AND a.appointmentStart < :endTime " +
           "AND a.appointmentEnd > :startTime")
    List<Appointment> findOverlappingAppointments(
        @Param("doctorId") Long doctorId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime,
        @Param("statusExcluded") List<Appointment.AppointmentStatus> statusExcluded);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId " +
           "AND a.appointmentStart >= :startDateTime " +
           "AND a.appointmentStart < :endDateTime")
    List<Appointment> findByDoctorIdAndDateRange(
        @Param("doctorId") Long doctorId,
        @Param("startDateTime") LocalDateTime startDateTime,
        @Param("endDateTime") LocalDateTime endDateTime);

}
