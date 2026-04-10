package com.example.eircare_backend.controller;

import java.util.Comparator;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.eircare_backend.JWTUtil;
import com.example.eircare_backend.TokenChecker;
import com.example.eircare_backend.model.Doctor;
import com.example.eircare_backend.model.Patient;
import com.example.eircare_backend.model.Practice;
import com.example.eircare_backend.repository.DoctorRepository;
import com.example.eircare_backend.repository.PatientRepository;
import com.example.eircare_backend.repository.PracticeRepository;
import com.example.eircare_backend.service.DoctorComparator;

@RestController
@RequestMapping("/api/practices")
@CrossOrigin(origins = "*")
public class PracticeController {

    private final PracticeRepository practiceRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final JWTUtil jwtUtil;
    private final TokenChecker tokenChecker;

    public PracticeController(PracticeRepository practiceRepository, DoctorRepository doctorRepository, PatientRepository patientRepository, JWTUtil jwtUtil, TokenChecker tokenChecker) {

        this.practiceRepository = practiceRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.jwtUtil = jwtUtil;
        this.tokenChecker = tokenChecker;
    }

    @GetMapping
    public List<Practice> getPractices(@RequestParam(required = false) String name, @RequestHeader("Authorization") String tokenHeader) {

        tokenChecker.validTokenRequired(tokenHeader);

        if (name != null && !name.isBlank()) {

            return practiceRepository.findByNameContainingIgnoreCase(name);
        }
        return practiceRepository.findAll();
    }

    @GetMapping("/{id}")
    public Practice getPracticeById(@PathVariable Long id, @RequestHeader("Authorization") String tokenHeader) {

        tokenChecker.validTokenRequired(tokenHeader);

        Practice practice = practiceRepository.findById(id).orElseThrow(() -> new RuntimeException("Practice not found"));

        String token = tokenChecker.extractTokenFromHeader(tokenHeader);

        Patient patient = patientRepository.findByUserEmail(jwtUtil.getClaims(token).getSubject());

        if (patient != null && practice.getLatitude() != null && practice.getLongitude() != null) {

            DoctorComparator distanceCalc = new DoctorComparator(patient.getLatitude(), patient.getLongitude());

            double distance = distanceCalc.calculateDistance(patient.getLatitude(), patient.getLongitude(), practice.getLatitude(), practice.getLongitude());

            practice.setDistance(Math.round(distance * 10.0) / 10.0);
        }
        return practice;
    }

    @GetMapping("/{id}/doctors")
    public List<Doctor> getDoctorsByPractice(@PathVariable Long id, @RequestHeader("Authorization") String tokenHeader) {

        tokenChecker.validTokenRequired(tokenHeader);
        return doctorRepository.findByPracticeIdAndStatus(id, Doctor.Status.APPROVED);
    }

    @GetMapping("/sorted")
    public List<Practice> getSortedPractices(@RequestHeader("Authorization") String tokenHeader) {

        tokenChecker.validTokenRequired(tokenHeader);
        String token = tokenChecker.extractTokenFromHeader(tokenHeader);

        Patient patient = patientRepository.findByUserEmail(jwtUtil.getClaims(token).getSubject());

        if (patient == null || patient.getLatitude() == null || patient.getLongitude() == null) {

            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Patient location not set. Please update address.");
        }

        double patientLatitude = patient.getLatitude();
        double patientLongitude = patient.getLongitude();

        DoctorComparator distanceCalc = new DoctorComparator(patientLatitude, patientLongitude);

        List<Practice> practices = practiceRepository.findAll();

        
        practices.sort(Comparator.comparingDouble(practice ->
            (practice.getLatitude() != null && practice.getLongitude() != null)
                ? distanceCalc.calculateDistance(patientLatitude, patientLongitude, practice.getLatitude(), practice.getLongitude())
                : Double.MAX_VALUE
        )
        );

        for (Practice practice : practices) {

            if (practice.getLatitude() != null && practice.getLongitude() != null) {

                double distance = distanceCalc.calculateDistance(patientLatitude, patientLongitude, practice.getLatitude(), practice.getLongitude());
                practice.setDistance(Math.round(distance * 10.0) / 10.0);
            }
            List<Doctor> doctors = doctorRepository.findByPracticeIdAndStatus(practice.getId(), Doctor.Status.APPROVED);

            practice.setTakingBookings(!doctors.isEmpty());
            practice.setHasVirtualAppointments(doctors.stream().anyMatch(doctor -> Boolean.TRUE.equals(doctor.getProvidesVirtualAppointments())));
        }

        return practices;
    }
}
