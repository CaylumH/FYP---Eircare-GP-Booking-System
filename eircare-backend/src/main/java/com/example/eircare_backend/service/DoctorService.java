package com.example.eircare_backend.service;

import java.time.DayOfWeek;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.eircare_backend.model.Doctor;
import com.example.eircare_backend.model.DoctorAvailability;
import com.example.eircare_backend.repository.DoctorAvailablityRepository;
import com.example.eircare_backend.repository.DoctorRepository;

@Service
public class DoctorService {

    private DoctorRepository doctorRepository;
    private DoctorAvailablityRepository doctorAvailabilityRepository;

    public DoctorService(DoctorRepository doctorRepository, DoctorAvailablityRepository doctorAvailabilityRepository) {
        this.doctorRepository = doctorRepository;
        this.doctorAvailabilityRepository = doctorAvailabilityRepository;
    }

    public List<Doctor> DoctorSorter(double patientLatitude, double patientLongitude) {

        List<Doctor> doctors = doctorRepository.findByStatus(Doctor.Status.APPROVED);

        DoctorComparator comparator = new DoctorComparator(patientLatitude, patientLongitude);
        
        doctors.sort(comparator);
        for (Doctor doctor : doctors) {
            double distance = comparator.calculateDistance(patientLatitude, patientLongitude, doctor.getLatitude(), doctor.getLongitude());
            doctor.setDistance(Math.round(distance * 10.0) / 10.0);
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
    
}