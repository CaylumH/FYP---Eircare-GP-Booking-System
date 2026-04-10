package com.example.eircare_backend.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.eircare_backend.model.Practice;

public interface PracticeRepository extends JpaRepository<Practice, Long> {
    Practice findByPhoneNumberAndStatus(String phoneNumber, Practice.Status status);
    Practice findByPhoneNumber(String phoneNumber);

    List<Practice> findByStatus(Practice.Status status);

    List<Practice> findByNameContainingIgnoreCase(String name); //ignores case
    List<Practice> findByLatitudeIsNull();
}
