package com.example.eircare_backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.eircare_backend.JWTUtil;
import com.example.eircare_backend.LoginRequest;
import com.example.eircare_backend.TokenChecker;
import com.example.eircare_backend.model.Doctor;
import com.example.eircare_backend.model.User;
import com.example.eircare_backend.repository.UserRepository;
import com.example.eircare_backend.service.AdminService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    private final UserRepository userRepository;
    private final JWTUtil jwtUtil;

    private final TokenChecker tokenChecker;
    private final BCryptPasswordEncoder passwordHasher = new BCryptPasswordEncoder();

    public AdminController(AdminService adminService, UserRepository userRepository, JWTUtil jwtUtil, TokenChecker tokenChecker) {
        this.adminService = adminService;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.tokenChecker = tokenChecker;
    }

    @PostMapping("/login")

    public Map<String, String> loginAdmin(@RequestBody LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail());

        if (user == null || user.getRole() != User.Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        if (!passwordHasher.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        String token = jwtUtil.createToken(user.getEmail(), user.getRole());

        return Map.of("token", token, "userId", String.valueOf(user.getId()));
    }
    @GetMapping("/doctors/pending")
    public List<Doctor> getPendingDoctors(@RequestHeader("Authorization") String tokenHeader) {

        tokenChecker.roleRequired(tokenHeader, User.Role.ADMIN);

        return adminService.getPendingDoctors();
    }

    @PostMapping("/doctors/{id}/approve")
    public void approveDoctor(@PathVariable Long id, @RequestHeader("Authorization") String tokenHeader) {

        tokenChecker.roleRequired(tokenHeader, User.Role.ADMIN);

        adminService.approveDoctor(id);
    }

    @PostMapping("/doctors/{id}/reject")
    public void rejectDoctor(@PathVariable Long id, @RequestHeader("Authorization") String tokenHeader) {

        tokenChecker.roleRequired(tokenHeader, User.Role.ADMIN);

        adminService.rejectDoctor(id);
    }

    @GetMapping("/users")
    public List<User> getAllUsers(@RequestHeader("Authorization") String tokenHeader) {
        
        tokenChecker.roleRequired(tokenHeader, User.Role.ADMIN);
        return adminService.getAllUsers();
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id, @RequestHeader("Authorization") String tokenHeader) {
        tokenChecker.roleRequired(tokenHeader, User.Role.ADMIN);
        adminService.deleteUser(id);
    }
}
