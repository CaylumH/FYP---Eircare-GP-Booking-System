package com.example.eircare_backend;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.eircare_backend.model.User;
import com.example.eircare_backend.repository.UserRepository;

@Component
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;

    private final BCryptPasswordEncoder passwordHasher = new BCryptPasswordEncoder();

    public DataInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(ApplicationArguments args) {

        String adminEmail = "admin1@gmail.com";
        if (userRepository.findByEmail(adminEmail) == null) {

            User admin = new User();
            admin.setEmail(adminEmail);
            admin.setPassword(passwordHasher.encode("pass1234"));
            admin.setRole(User.Role.ADMIN);
            userRepository.save(admin);
            
        }
    }
}
