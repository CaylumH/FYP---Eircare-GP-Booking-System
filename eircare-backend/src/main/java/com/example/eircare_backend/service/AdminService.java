package com.example.eircare_backend.service;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.util.List;
import com.example.eircare_backend.dto.LatLong;
import com.example.eircare_backend.model.Doctor;
import com.example.eircare_backend.model.Practice;
import com.example.eircare_backend.model.User;
import com.example.eircare_backend.model.Patient;
import com.example.eircare_backend.repository.DoctorRepository;
import com.example.eircare_backend.repository.PatientRepository;
import com.example.eircare_backend.repository.PracticeRepository;
import com.example.eircare_backend.repository.UserRepository;
import com.example.eircare_backend.repository.AppointmentRepository;

@Service
public class AdminService {

    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final PracticeRepository practiceRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final NominatimService nominatimService;

    public AdminService(DoctorRepository doctorRepository, PatientRepository patientRepository, PracticeRepository practiceRepository, UserRepository userRepository, AppointmentRepository appointmentRepository, NominatimService nominatimService) {
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.practiceRepository = practiceRepository;
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
        this.nominatimService = nominatimService;
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

        Doctor doctor = doctorRepository.findByUserId(userId);

        if (doctor != null) {

            appointmentRepository.deleteAll(appointmentRepository.findByDoctorId(doctor.getId()));
            doctorRepository.delete(doctor);
        }

        Patient patient = patientRepository.findByUserId(userId);
        if (patient != null) {
            
            appointmentRepository.deleteAll(appointmentRepository.findByPatientId(patient.getId()));
            patientRepository.delete(patient);
        }

        userRepository.delete(user);
    }

    @Async
    public void reGeocodeAllMissing() {

        List<Practice> missingPractices = practiceRepository.findByLatitudeIsNull();

        System.out.println("Re-geocoding " + missingPractices.size() + " practices...");
        for (Practice practice : missingPractices) {

            try {
                LatLong latLong = nominatimService.getLatLongFromAddress(practice.getAddress());

                practice.setLatitude(latLong.getLatitude());
                practice.setLongitude(latLong.getLongitude());

                practiceRepository.save(practice);
                System.out.println("Successfully re-geocoded: " + practice.getName());

            } catch (Exception e) {

                System.out.println("Failed: " + practice.getName() + " - " + e.getMessage());
            }
            try { Thread.sleep(2000); } catch (InterruptedException e) {}
        }

        System.out.println("Re-geocoding complete.");
    }

    public Practice importPractice(Practice practice) {

        if (practiceRepository.findByPhoneNumberAndStatus(practice.getPhoneNumber(), Practice.Status.UNCLAIMED) != null) {

            throw new RuntimeException("Practice with this phone number has already b een imported");
        }
        try {
            LatLong latLong = nominatimService.getLatLongFromAddress(practice.getAddress());

            practice.setLatitude(latLong.getLatitude());

            practice.setLongitude(latLong.getLongitude());

        } catch (RuntimeException e) {

            practice.setLatitude(null);
            practice.setLongitude(null);
        }

        practice.setStatus(Practice.Status.UNCLAIMED);
        
        return practiceRepository.save(practice);
    }
}
