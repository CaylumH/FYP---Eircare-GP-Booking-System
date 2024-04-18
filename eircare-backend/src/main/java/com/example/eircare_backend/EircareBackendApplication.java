package com.example.eircare_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class EircareBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(EircareBackendApplication.class, args);
	}

}
