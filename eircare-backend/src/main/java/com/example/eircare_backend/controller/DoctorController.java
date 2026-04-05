package com.example.eircare_backend.controller;

import java.util.List;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.example.eircare_backend.JWTUtil;
import com.example.eircare_backend.LoginRequest;
import com.example.eircare_backend.LoginResponse;
import com.example.eircare_backend.dto.LatLong;
import com.example.eircare_backend.model.Doctor;
import com.example.eircare_backend.model.DoctorAvailability;
import com.example.eircare_backend.model.DoctorBreak;
import com.example.eircare_backend.model.Patient;
import com.example.eircare_backend.repository.DoctorAvailablityRepository;
import com.example.eircare_backend.repository.DoctorBreakRepository;
import com.example.eircare_backend.repository.DoctorRepository;
import com.example.eircare_backend.repository.PatientRepository;
import com.example.eircare_backend.repository.UserRepository;
import com.example.eircare_backend.model.User;
import com.example.eircare_backend.service.DoctorService;
import com.example.eircare_backend.service.NominatimService;
import com.example.eircare_backend.TokenChecker;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "http://localhost:5173")
public class DoctorController {

    private final DoctorRepository doctorRepository;
    private final DoctorService doctorService;
    private final DoctorAvailablityRepository doctorAvailabilityRepository;
    private final DoctorBreakRepository doctorBreakRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final NominatimService nominatimService;
    private final JWTUtil jwtUtil;
    private final TokenChecker tokenChecker;
    private final BCryptPasswordEncoder passwordHasher = new BCryptPasswordEncoder();

    public DoctorController(DoctorRepository doctorRepository,  DoctorService doctorService, DoctorAvailablityRepository doctorAvailabilityRepository, DoctorBreakRepository doctorBreakRepository, PatientRepository patientRepository, UserRepository userRepository, NominatimService nominatimService, JWTUtil jwtUtil, TokenChecker tokenChecker) {
        this.doctorRepository = doctorRepository;
        this.doctorService = doctorService;
        this.doctorAvailabilityRepository = doctorAvailabilityRepository;
        this.doctorBreakRepository = doctorBreakRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.nominatimService = nominatimService;
        this.jwtUtil = jwtUtil;
        this.tokenChecker = tokenChecker;
    }   

    @GetMapping
    public List<Doctor> getAllDoctors(@RequestHeader("Authorization") String tokenHeader) {
        tokenChecker.validTokenRequired(tokenHeader);
        return doctorRepository.findAll();
    }

    @PostMapping("/register")
    public Doctor registerDoctor(@RequestBody Doctor doctor) {
        if (userRepository.findByEmail(doctor.getUser().getEmail()) != null) {
            throw new RuntimeException("Email already exists");
        }

        try{
        LatLong latLong = nominatimService.getLatLongFromAddress(doctor.getPracticeAddress());

        System.out.println(latLong.getLatitude() + " " + latLong.getLongitude());

        doctor.setLatitude(latLong.getLatitude());
        doctor.setLongitude(latLong.getLongitude());
        }
        catch (RuntimeException e) {
            throw new RuntimeException("Invalid Address");
        }

        //hash password
        doctor.getUser().setPassword(passwordHasher.encode(doctor.getUser().getPassword()));
        userRepository.save(doctor.getUser());

        return doctorRepository.save(doctor);
    }

    @PostMapping("/login")
    public LoginResponse loginDoctor(@RequestBody LoginRequest request) {
        Doctor doctor = doctorRepository.findByUserEmail(request.getEmail());
        if (doctor == null) {
            throw new RuntimeException("Wrong email");
        }
        if (!passwordHasher.matches(request.getPassword(), doctor.getUser().getPassword())) {
            throw new RuntimeException("Wrong password pal");
        }
        String token = jwtUtil.createToken(doctor.getUser().getEmail(), doctor.getUser().getRole());
        return new LoginResponse(token, doctor);
    }

    @GetMapping("/{id}")
    public Doctor getDoctorById(@PathVariable Long id, @RequestHeader("Authorization") String tokenHeader) {
            tokenChecker.validTokenRequired(tokenHeader);

            System.out.println(id);

        return doctorRepository.findById(id).orElseThrow(() -> new RuntimeException("Doctor not found"));
    }

    @PutMapping("/{id}")
    public Doctor updateDoctor(@PathVariable Long id, @RequestBody Doctor updatedDoctor, @RequestHeader("Authorization") String tokenHeader) {
        tokenChecker.validTokenRequired(tokenHeader);
        tokenChecker.roleRequired(tokenHeader, User.Role.DOCTOR);
        tokenChecker.idRequired(tokenHeader, User.Role.DOCTOR, id);

        Doctor doctor = doctorRepository.findById(id).orElseThrow(() -> new RuntimeException("Doctor not found"));

        doctor.setFirstName(updatedDoctor.getFirstName());
        doctor.setLastName(updatedDoctor.getLastName());
        doctor.setPhoneNumber(updatedDoctor.getPhoneNumber());
        doctor.setPracticeName(updatedDoctor.getPracticeName());
        doctor.setMedicalCouncilNumber(updatedDoctor.getMedicalCouncilNumber());
        doctor.setProvidesVirtualAppointments(updatedDoctor.getProvidesVirtualAppointments());

        if (updatedDoctor.getUser() != null && updatedDoctor.getUser().getEmail() != null) {
            doctor.getUser().setEmail(updatedDoctor.getUser().getEmail());
        }

        String updatedPracticeAddress = updatedDoctor.getPracticeAddress();
        if (updatedPracticeAddress != null && !updatedPracticeAddress.isBlank()) {
            doctor.setPracticeAddress(updatedPracticeAddress);

            LatLong latLong = nominatimService.getLatLongFromAddress(updatedPracticeAddress);
            doctor.setLatitude(latLong.getLatitude());
            doctor.setLongitude(latLong.getLongitude());
        }

        userRepository.save(doctor.getUser());
        return doctorRepository.save(doctor);
    }

    @DeleteMapping("/{id}")
    public void deleteDoctor(@PathVariable Long id, @RequestHeader("Authorization") String tokenHeader) {
        tokenChecker.validTokenRequired(tokenHeader);
        tokenChecker.roleRequired(tokenHeader, User.Role.DOCTOR);
        tokenChecker.idRequired(tokenHeader, User.Role.DOCTOR, id);
        doctorRepository.deleteById(id);
    }

    @GetMapping("/sorted")
    public List<Doctor> getSortedDoctors(@RequestHeader("Authorization") String tokenHeader) {
        tokenChecker.validTokenRequired(tokenHeader);
        String token = tokenChecker.extractTokenFromHeader(tokenHeader);
        Patient patient = patientRepository.findByUserEmail(jwtUtil.getClaims(token).getSubject());
        
        double patientLatitude = patient.getLatitude();
        double patientLongitude = patient.getLongitude();

        return doctorService.DoctorSorter(patientLatitude, patientLongitude);
}

    @PostMapping("/uploadProfilePicture")
    public void uploadProfilePicture(@RequestHeader("Authorization") String tokenHeader, @RequestParam Long doctorId, @RequestParam ("profilePicture") MultipartFile profilePicture) {
        
        tokenChecker.validTokenRequired(tokenHeader);

        tokenChecker.roleRequired(tokenHeader, User.Role.DOCTOR);
        tokenChecker.idRequired(tokenHeader, User.Role.DOCTOR, doctorId);
        if (profilePicture == null || profilePicture.isEmpty()) {
            throw new RuntimeException("No pfp uplaoded");
        }

        String fileDirectory = "uploads/";
        Path filePath = Paths.get(fileDirectory);
        Doctor doctor;

        doctor = doctorRepository.findById(doctorId).orElseThrow(() -> new RuntimeException("Doctor not found in repo"));

        String token = tokenChecker.extractTokenFromHeader(tokenHeader);
        String tokenEmail = jwtUtil.getClaims(token).getSubject();

        String contentType = profilePicture.getContentType();
        if (!contentType.startsWith("image/")) {
            throw new RuntimeException("Please upload image file");
        }

        String originalFilename = profilePicture.getOriginalFilename();

        if (originalFilename == null || originalFilename.isBlank()) {
            originalFilename = "pfp_" + doctor.getId() + ".jpg";
        }
        String fileName = doctor.getId() + "_" + originalFilename;

        try {
            if (!Files.exists(filePath)) {
                Files.createDirectories(filePath);
            }

            try (InputStream inputStream = profilePicture.getInputStream()) {
                Files.copy(inputStream, filePath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to save profile picture", e);
        }

        String profilePictureUrl = "/uploads/" + fileName;


        doctor.setProfilePictureUrl(profilePictureUrl);
        doctorRepository.save(doctor);

    }

    @GetMapping("/{id}/profilePicture")
    public ResponseEntity<byte[]> getProfilePicture(@PathVariable Long id) {
        Doctor doctor = doctorRepository.findById(id).orElseThrow(() -> new RuntimeException("Doctor not found"));
        String profilePictureUrl = doctor.getProfilePictureUrl();
        if (profilePictureUrl == null || profilePictureUrl.isBlank()) {
            return ResponseEntity.notFound().build();
        }

        try {
            String pfpFileName = Paths.get(profilePictureUrl).getFileName().toString();
            Path pfpFilePath = Paths.get("uploads").resolve(pfpFileName).normalize();

            if (!Files.exists(pfpFilePath) || Files.isDirectory(pfpFilePath)) {
                return ResponseEntity.notFound().build();
            }

            byte[] pfpBytes = Files.readAllBytes(pfpFilePath);
            String contentType = Files.probeContentType(pfpFilePath);
            MediaType mediaType;
            if (contentType == null){
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
            }
            else{
                    mediaType = MediaType.parseMediaType(contentType);
            }

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .body(pfpBytes);
        } catch (Exception error) {
            throw new RuntimeException("Failed to load pfp", error);
        }
    }

    @PostMapping("/{doctorId}/availability")
    public void setDoctorAvailability(@PathVariable Long doctorId, @RequestBody DoctorAvailability doctorAvailability) {

        System.out.println(doctorAvailability.getDay() + " " + doctorAvailability.getOpeningTime() + " " + doctorAvailability.getClosingTime());

        doctorService.setDoctorAvailability(doctorId, doctorAvailability.getDay(), doctorAvailability.getOpeningTime(), doctorAvailability.getClosingTime());
    }

    @GetMapping("/{doctorId}/availability")
    public DoctorAvailability getDoctorAvailability(@PathVariable Long doctorId, @RequestParam String day) {
        return doctorService.getDoctorAvailability(doctorId, day);
    }

    @PostMapping("/{doctorId}/breaks")
    public DoctorBreak addDoctorBreak(@PathVariable Long doctorId, @RequestBody DoctorBreak doctorBreak) {

        DoctorAvailability doctorAvailability = doctorAvailabilityRepository.findByDoctorIdAndDay(doctorId, doctorBreak.getDay().toString());
        if (doctorAvailability == null || doctorAvailability.getOpeningTime() == null || doctorAvailability.getClosingTime() == null) {
            throw new RuntimeException("Set availability before adding breaks");
        }

        LocalTime breakStart = LocalTime.parse(doctorBreak.getBreakStart());
        LocalTime breakEnd = LocalTime.parse(doctorBreak.getBreakEnd());
        LocalTime openingTime = LocalTime.parse(doctorAvailability.getOpeningTime());
        LocalTime closingTime = LocalTime.parse(doctorAvailability.getClosingTime());

        if (!breakStart.isBefore(breakEnd)) {
            throw new RuntimeException("breakStart must be before breakEnd");
        }

        if (breakStart.isBefore(openingTime) || breakEnd.isAfter(closingTime)) {
            throw new RuntimeException("Break must be between opening and closing");
        }

        doctorBreak.setDoctorId(doctorId);
        return doctorBreakRepository.save(doctorBreak);
    }

    @GetMapping("/{doctorId}/breaks")
    public List<DoctorBreak> getDoctorBreaks(@PathVariable Long doctorId, @RequestParam String day) {
        return doctorBreakRepository.findByDoctorIdAndDay(doctorId, day.toUpperCase());
    }


}