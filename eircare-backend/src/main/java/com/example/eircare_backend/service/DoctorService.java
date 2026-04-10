package com.example.eircare_backend.service;

import java.time.DayOfWeek;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.eircare_backend.model.Doctor;
import com.example.eircare_backend.model.Practice;
import com.example.eircare_backend.model.User;
import com.example.eircare_backend.model.DoctorAvailability;
import com.example.eircare_backend.repository.DoctorAvailablityRepository;
import com.example.eircare_backend.repository.DoctorRepository;
import com.example.eircare_backend.repository.PracticeRepository;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final PracticeRepository practiceRepository;
    private final DoctorAvailablityRepository doctorAvailabilityRepository;

    public DoctorService(DoctorRepository doctorRepository, PracticeRepository practiceRepository, DoctorAvailablityRepository doctorAvailabilityRepository) {
        this.doctorRepository = doctorRepository;
        this.practiceRepository = practiceRepository;
        this.doctorAvailabilityRepository = doctorAvailabilityRepository;
    }

    public List<Doctor> DoctorSorter(double patientLatitude, double patientLongitude) {
        List<Doctor> doctors = doctorRepository.findByStatus(Doctor.Status.APPROVED);
        DoctorComparator comparator = new DoctorComparator(patientLatitude, patientLongitude);
        doctors.sort(comparator);
        for (Doctor doctor : doctors) {
            if (doctor.getPractice() != null) {
                double distance = comparator.calculateDistance(patientLatitude, patientLongitude, doctor.getPractice().getLatitude(), doctor.getPractice().getLongitude());
                doctor.getPractice().setDistance(Math.round(distance * 10.0) / 10.0);
            }
        }
        return doctors;
    }

    public void setDoctorAvailability(Long doctorId, DayOfWeek day, String openingTime, String closingTime) {
        DoctorAvailability doctorAvailability = doctorAvailabilityRepository.findByDoctorIdAndDay(doctorId, day);
        if (doctorAvailability == null) {
            doctorAvailability = new DoctorAvailability();
            doctorAvailability.setDoctorId(doctorId);
            doctorAvailability.setDay(day);
        }
        doctorAvailability.setOpeningTime(openingTime);
        doctorAvailability.setClosingTime(closingTime);
        doctorAvailabilityRepository.save(doctorAvailability);
    }

    public DoctorAvailability getDoctorAvailability(Long doctorId, String day) {
        return doctorAvailabilityRepository.findByDoctorIdAndDay(doctorId, DayOfWeek.valueOf(day.toUpperCase()));
    }

    public Doctor claimProfile(String phoneNumber, User user) {

        Practice practice = practiceRepository.findByPhoneNumber(phoneNumber.trim());

        if (practice == null) {
            throw new RuntimeException("No practice found with that phone number");
        }

        if (practice.getStatus() == Practice.Status.UNCLAIMED) {
            practice.setStatus(Practice.Status.CLAIMED);
            practiceRepository.save(practice);
        }

        Doctor doctor = new Doctor();

        doctor.setUser(user);
        doctor.setPractice(practice);
        
        doctor.setStatus(Doctor.Status.PENDING);
        return doctorRepository.save(doctor);
    }
}
