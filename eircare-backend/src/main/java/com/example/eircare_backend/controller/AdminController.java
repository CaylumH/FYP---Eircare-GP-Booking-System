package com.example.eircare_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import jakarta.persistence.EntityManager;

@RestController
public class AdminController {

    @Autowired
    private EntityManager entityManager;

    @PostMapping("/api/admin/reset")
    public String resetDatabase(@RequestHeader("Authorization") String token) {

    entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 0").executeUpdate();

    entityManager.createNativeQuery("TRUNCATE TABLE appointment").executeUpdate();
    entityManager.createNativeQuery("TRUNCATE TABLE doctor").executeUpdate();

    entityManager.createNativeQuery("TRUNCATE TABLE patient").executeUpdate();

    entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 1").executeUpdate();

    return "DB reset!!!!!";
}
}