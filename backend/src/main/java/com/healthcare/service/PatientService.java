package com.healthcare.service;

import com.healthcare.entity.Patient;
import com.healthcare.exception.BadRequestException;
import com.healthcare.exception.ResourceNotFoundException;
import com.healthcare.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @Transactional(readOnly = true)
    public List<Patient> getAllPatients(String search) {
        if (search != null && !search.trim().isEmpty()) {
            return patientRepository.searchPatients(search.trim());
        }
        return patientRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Patient getPatientById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + id));
    }

    public Patient createPatient(Patient patient) {
        if (patient.getFullName() == null || patient.getFullName().trim().isEmpty()) {
            throw new BadRequestException("Patient full name cannot be blank");
        }
        if (patient.getAge() == null || patient.getAge() < 0 || patient.getAge() > 130) {
            throw new BadRequestException("Age must be between 0 and 130");
        }
        if (patient.getRegistrationDate() == null) {
            patient.setRegistrationDate(LocalDate.now());
        }
        return patientRepository.save(patient);
    }

    public Patient updatePatient(Long id, Patient updated) {
        Patient existing = getPatientById(id);

        if (updated.getFullName() == null || updated.getFullName().trim().isEmpty()) {
            throw new BadRequestException("Patient full name cannot be blank");
        }
        if (updated.getAge() == null || updated.getAge() < 0 || updated.getAge() > 130) {
            throw new BadRequestException("Age must be between 0 and 130");
        }

        existing.setFullName(updated.getFullName().trim());
        existing.setAge(updated.getAge());
        existing.setGender(updated.getGender());
        existing.setPhone(updated.getPhone());
        existing.setEmail(updated.getEmail());
        existing.setAddress(updated.getAddress());
        if (updated.getRegistrationDate() != null) {
            existing.setRegistrationDate(updated.getRegistrationDate());
        }

        return patientRepository.save(existing);
    }

    public void deletePatient(Long id) {
        Patient existing = getPatientById(id);
        patientRepository.delete(existing);
    }
}
