package com.example.eircare_backend.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.eircare_backend.model.Patient;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    Patient findByUserEmail(String email);
}
