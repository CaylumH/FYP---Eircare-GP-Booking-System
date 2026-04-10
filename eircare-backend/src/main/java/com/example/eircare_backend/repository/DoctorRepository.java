package com.example.eircare_backend.repository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.eircare_backend.model.Doctor;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Doctor findByUserEmail(String email);
    Doctor findByUserId(Long userId);
    List<Doctor> findByStatus(Doctor.Status status);
    List<Doctor> findByPracticeId(Long practiceId);
    
    List<Doctor> findByPracticeIdAndStatus(Long practiceId, Doctor.Status status);
}
