package com.example.eircare_backend.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.eircare_backend.model.Doctor;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Doctor findByUserEmail(String email);
    
}
