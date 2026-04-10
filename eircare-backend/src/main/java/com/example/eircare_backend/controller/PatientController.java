package com.example.eircare_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.example.eircare_backend.JWTUtil;
import com.example.eircare_backend.LoginRequest;
import com.example.eircare_backend.LoginResponse;
import com.example.eircare_backend.dto.LatLong;
import com.example.eircare_backend.model.Patient;
import com.example.eircare_backend.repository.PatientRepository;
import com.example.eircare_backend.repository.UserRepository;
import com.example.eircare_backend.model.User;
import com.example.eircare_backend.service.NominatimService;
import com.example.eircare_backend.TokenChecker;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "*")
public class PatientController {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final NominatimService nominatimService;
    private final JWTUtil jwtUtil;
    private final TokenChecker tokenChecker;
    private final BCryptPasswordEncoder passwordHasher = new BCryptPasswordEncoder();

    public PatientController(PatientRepository patientRepository, UserRepository userRepository, NominatimService nominatimService, JWTUtil jwtUtil, TokenChecker tokenChecker) {
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.nominatimService = nominatimService;
        this.jwtUtil = jwtUtil;
        this.tokenChecker = tokenChecker;
    }

    @GetMapping
    public List<Patient> getAllPatients(@RequestHeader("Authorization") String tokenHeader) {
        tokenChecker.validTokenRequired(tokenHeader);

        return patientRepository.findAll();
    }

    @GetMapping("/{id}")
    public Patient getPatientById(@PathVariable Long id, @RequestHeader("Authorization") String tokenHeader) {
        System.out.println("getPatientById " + id);
        tokenChecker.validTokenRequired(tokenHeader);
        return patientRepository.findById(id).orElseThrow(() -> new RuntimeException("Patient not found"));
    }

    @PostMapping("/register")
    public Patient registerPatient(@RequestBody Patient patient) {

        if (userRepository.findByEmail(patient.getUser().getEmail()) != null) {
            throw new RuntimeException("Email already exists");
        }

        //TODO: Hash password

        
        try {
            LatLong latLong = nominatimService.getLatLongFromAddress(patient.getAddress());

            patient.setLatitude(latLong.getLatitude());
            patient.setLongitude(latLong.getLongitude());

            } catch (RuntimeException e) {
  throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not verify address. Please try entering a different address");
            
        }

        patient.getUser().setPassword(passwordHasher.encode(patient.getUser().getPassword()));
        userRepository.save(patient.getUser());

        return patientRepository.save(patient);
    }

    @PostMapping("/login")
    public LoginResponse loginPatient(@RequestBody LoginRequest request) {
        Patient patient = patientRepository.findByUserEmail(request.getEmail());
        if (patient == null) {
            throw new RuntimeException("Wrong email");
        }

        if (!passwordHasher.matches(request.getPassword(), patient.getUser().getPassword())) {
            throw new RuntimeException("Wrong password pal");
        }
        String token = jwtUtil.createToken(patient.getUser().getEmail(), patient.getUser().getRole());
        return new LoginResponse(token, patient);
    }

    @PutMapping("/{id}")
    public Patient updatePatient(@PathVariable Long id, @RequestBody Patient updatedPatient, @RequestHeader("Authorization") String tokenHeader) {
        tokenChecker.validTokenRequired(tokenHeader);

        Patient patient = patientRepository.findById(id).orElseThrow(() -> new RuntimeException("Patient not found"));

        patient.setFirstName(updatedPatient.getFirstName());
        patient.setLastName(updatedPatient.getLastName());
        patient.setPhoneNumber(updatedPatient.getPhoneNumber());

        
        patient.getUser().setEmail(updatedPatient.getUser().getEmail());
        

        patient.setAddress(updatedPatient.getAddress());

        try {
            LatLong latLong = nominatimService.getLatLongFromAddress(updatedPatient.getAddress());
            
            patient.setLatitude(latLong.getLatitude());

            patient.setLongitude(latLong.getLongitude());
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldnt verify address. Please try entering a different address.");
        }

        userRepository.save(patient.getUser());
        return patientRepository.save(patient);
    }

    @DeleteMapping("/{id}")
    public void deletePatient(@PathVariable Long id, @RequestHeader("Authorization") String tokenHeader) {
        tokenChecker.validTokenRequired(tokenHeader);
        patientRepository.deleteById(id);
    }
}
