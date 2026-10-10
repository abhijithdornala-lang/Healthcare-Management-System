package com.healthcare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main Entry Point for Healthcare Management System Application.
 * Starts the embedded Tomcat web server and initializes Spring Data JPA with MySQL.
 */
@SpringBootApplication
public class HealthcareApplication {

    public static void main(String[] args) {
        SpringApplication.run(HealthcareApplication.class, args);
        System.out.println("=================================================");
        System.out.println(" Healthcare Management System Started Successfully! ");
        System.out.println(" Web Portal: http://localhost:8080/index.html   ");
        System.out.println(" REST API Base: http://localhost:8080/api/       ");
        System.out.println("=================================================");
    }
}
