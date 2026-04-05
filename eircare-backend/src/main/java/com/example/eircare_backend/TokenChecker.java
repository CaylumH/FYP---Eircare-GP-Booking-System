package com.example.eircare_backend;
import com.example.eircare_backend.model.User;
import com.example.eircare_backend.model.Doctor;
import com.example.eircare_backend.model.Patient;
import com.example.eircare_backend.repository.DoctorRepository;
import com.example.eircare_backend.repository.PatientRepository;
import io.jsonwebtoken.Claims;
import org.springframework.stereotype.Component;

@Component
    public class TokenChecker {

    private final JWTUtil jwtUtil;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    public TokenChecker(JWTUtil jwtUtil, DoctorRepository doctorRepository, PatientRepository patientRepository) {
        this.jwtUtil = jwtUtil;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
    }

    public String extractTokenFromHeader(String header) {
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        throw new RuntimeException("No token");
    }

    public Claims validTokenRequired(String header) {
        String token = extractTokenFromHeader(header);

        if (!jwtUtil.isTokenValid(token)) {
            throw new RuntimeException("Token no good pal");
        }
        return jwtUtil.getClaims(token);
    }

    public void roleRequired(String header, User.Role role){
        String token = extractTokenFromHeader(header);
        validTokenRequired(header);
        if (!jwtUtil.isRoleValid(token, role)) {
            throw new RuntimeException("User not authorised");
        }
    }

    public void multiRolesRequired(String header, User.Role... roles) {
        String token = extractTokenFromHeader(header);
        validTokenRequired(header);

        for (User.Role role : roles) {
            if (jwtUtil.isRoleValid(token, role)) {
                return;
            }
        }

        throw new RuntimeException("User not authorised");
    }

    public void idRequired(String header, User.Role role, Long idFromRequest) {
        
        Claims claims = validTokenRequired(header);
        String email = claims.getSubject();
        Long idFromToken;

        if (role == User.Role.DOCTOR) {
            Doctor doctor = doctorRepository.findByUserEmail(email);
            if (doctor == null) {
                throw new RuntimeException("Doctor not found");
            }
            idFromToken = doctor.getId();
        } 
        else if (role == User.Role.PATIENT) {
            Patient patient = patientRepository.findByUserEmail(email);

            if (patient == null) {

                throw new RuntimeException("Patient not found");
            }
            idFromToken = patient.getId();
            
        } else {
            throw new RuntimeException("Ivalid role");
        }

        if (!idFromToken.equals(idFromRequest)) {
            throw new RuntimeException("User not authorised");
        }
    }
    }