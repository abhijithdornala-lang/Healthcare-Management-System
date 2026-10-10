package com.healthcare.service;

import com.healthcare.entity.Doctor;
import com.healthcare.exception.BadRequestException;
import com.healthcare.exception.ResourceNotFoundException;
import com.healthcare.repository.DoctorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    @Transactional(readOnly = true)
    public List<Doctor> getAllDoctors(String search) {
        if (search != null && !search.trim().isEmpty()) {
            return doctorRepository.searchDoctors(search.trim());
        }
        return doctorRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + id));
    }

    public Doctor createDoctor(Doctor doctor) {
        if (doctor.getFullName() == null || doctor.getFullName().trim().isEmpty()) {
            throw new BadRequestException("Doctor name cannot be blank");
        }
        if (doctor.getSpecialization() == null || doctor.getSpecialization().trim().isEmpty()) {
            throw new BadRequestException("Specialization cannot be blank");
        }
        if (doctor.getAvailabilityStatus() == null || doctor.getAvailabilityStatus().trim().isEmpty()) {
            doctor.setAvailabilityStatus("Available");
        }
        return doctorRepository.save(doctor);
    }

    public Doctor updateDoctor(Long id, Doctor updated) {
        Doctor existing = getDoctorById(id);

        if (updated.getFullName() == null || updated.getFullName().trim().isEmpty()) {
            throw new BadRequestException("Doctor name cannot be blank");
        }
        if (updated.getSpecialization() == null || updated.getSpecialization().trim().isEmpty()) {
            throw new BadRequestException("Specialization cannot be blank");
        }

        existing.setFullName(updated.getFullName().trim());
        existing.setSpecialization(updated.getSpecialization().trim());
        existing.setPhone(updated.getPhone());
        existing.setEmail(updated.getEmail());
        existing.setAvailabilityStatus(updated.getAvailabilityStatus() != null ? updated.getAvailabilityStatus() : "Available");

        return doctorRepository.save(existing);
    }

    public void deleteDoctor(Long id) {
        Doctor existing = getDoctorById(id);
        doctorRepository.delete(existing);
    }
}
