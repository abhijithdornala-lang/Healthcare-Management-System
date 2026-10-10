package com.healthcare.service;

import com.healthcare.dto.DashboardStatsDto;
import com.healthcare.repository.AppointmentRepository;
import com.healthcare.repository.DoctorRepository;
import com.healthcare.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    public DashboardService(PatientRepository patientRepository,
                            DoctorRepository doctorRepository,
                            AppointmentRepository appointmentRepository) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
    }

    public DashboardStatsDto getDashboardStats() {
        LocalDate today = LocalDate.now();

        long totalPatients = patientRepository.count();
        long totalDoctors = doctorRepository.count();
        long todayAppointments = appointmentRepository.countByAppointmentDate(today);
        long upcomingAppointments = appointmentRepository.countByAppointmentDateGreaterThan(today);

        return new DashboardStatsDto(totalPatients, totalDoctors, todayAppointments, upcomingAppointments);
    }
}
