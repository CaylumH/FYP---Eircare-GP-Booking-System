package com.example.eircare_backend.service;

import org.springframework.stereotype.Service;
import java.util.List;
import com.example.eircare_backend.model.Doctor;
import com.example.eircare_backend.model.User;
import com.example.eircare_backend.repository.DoctorRepository;
import com.example.eircare_backend.repository.UserRepository;
import com.example.eircare_backend.repository.AppointmentRepository;

@Service
public class AdminService {
    
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;

    public AdminService(DoctorRepository doctorRepository, UserRepository userRepository, AppointmentRepository appointmentRepository) {
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
    }

    public List<Doctor> getPendingDoctors() {
        return doctorRepository.findByStatus(Doctor.Status.PENDING);
    }

    public void approveDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        doctor.setStatus(Doctor.Status.APPROVED);
        doctorRepository.save(doctor);
    }

    public void rejectDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        doctor.setStatus(Doctor.Status.REJECTED);
        doctorRepository.save(doctor);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }
}