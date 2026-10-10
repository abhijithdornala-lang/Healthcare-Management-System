package com.healthcare.service;

import com.healthcare.dto.AppointmentRequestDto;
import com.healthcare.entity.Appointment;
import com.healthcare.entity.Doctor;
import com.healthcare.entity.DoctorSchedule;
import com.healthcare.entity.Patient;
import com.healthcare.exception.BadRequestException;
import com.healthcare.exception.ResourceNotFoundException;
import com.healthcare.repository.AppointmentRepository;
import com.healthcare.repository.DoctorRepository;
import com.healthcare.repository.DoctorScheduleRepository;
import com.healthcare.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@Transactional
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorScheduleRepository scheduleRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              PatientRepository patientRepository,
                              DoctorRepository doctorRepository,
                              DoctorScheduleRepository scheduleRepository) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.scheduleRepository = scheduleRepository;
    }

    @Transactional(readOnly = true)
    public List<Appointment> getAppointments(LocalDate date, Long doctorId, Long patientId, String status) {
        String cleanStatus = (status != null && !status.trim().isEmpty()) ? status.trim() : null;
        return appointmentRepository.filterAppointments(date, doctorId, patientId, cleanStatus);
    }

    @Transactional(readOnly = true)
    public Appointment getAppointmentById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));
    }

    public Appointment createAppointment(AppointmentRequestDto dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + dto.getPatientId()));

        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + dto.getDoctorId()));

        validateAppointmentDetails(doctor, dto.getAppointmentDate(), dto.getStartTime(), dto.getEndTime(), null);

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(dto.getAppointmentDate());
        appointment.setStartTime(dto.getStartTime());
        appointment.setEndTime(dto.getEndTime());
        appointment.setStatus(dto.getStatus() != null && !dto.getStatus().trim().isEmpty() ? dto.getStatus() : "Scheduled");
        appointment.setNotes(dto.getNotes());

        return appointmentRepository.save(appointment);
    }

    public Appointment updateAppointment(Long id, AppointmentRequestDto dto) {
        Appointment existing = getAppointmentById(id);

        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + dto.getPatientId()));

        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + dto.getDoctorId()));

        // If status is not Cancelled, perform full schedule and collision validation
        if (!"Cancelled".equalsIgnoreCase(dto.getStatus())) {
            validateAppointmentDetails(doctor, dto.getAppointmentDate(), dto.getStartTime(), dto.getEndTime(), id);
        }

        existing.setPatient(patient);
        existing.setDoctor(doctor);
        existing.setAppointmentDate(dto.getAppointmentDate());
        existing.setStartTime(dto.getStartTime());
        existing.setEndTime(dto.getEndTime());
        if (dto.getStatus() != null && !dto.getStatus().trim().isEmpty()) {
            existing.setStatus(dto.getStatus());
        }
        existing.setNotes(dto.getNotes());

        return appointmentRepository.save(existing);
    }

    public Appointment cancelAppointment(Long id) {
        Appointment existing = getAppointmentById(id);
        existing.setStatus("Cancelled");
        return appointmentRepository.save(existing);
    }

    private void validateAppointmentDetails(Doctor doctor, LocalDate date, LocalTime startTime, LocalTime endTime, Long excludeAppointmentId) {
        if (date == null) {
            throw new BadRequestException("Appointment date is required");
        }
        if (startTime == null || endTime == null) {
            throw new BadRequestException("Start time and end time are required");
        }
        if (!startTime.isBefore(endTime)) {
            throw new BadRequestException("Start time (" + startTime + ") must be before end time (" + endTime + ")");
        }
        if ("On Leave".equalsIgnoreCase(doctor.getAvailabilityStatus())) {
            throw new BadRequestException("Dr. " + doctor.getFullName() + " is currently marked as 'On Leave' and cannot accept appointments.");
        }

        // 1. Verify working schedule for the doctor
        String dayOfWeek = date.getDayOfWeek().name();
        List<DoctorSchedule> daySchedules = scheduleRepository.findByDoctorIdAndDayOfWeek(doctor.getId(), dayOfWeek);

        if (daySchedules.isEmpty()) {
            throw new BadRequestException("Dr. " + doctor.getFullName() + " is not scheduled to work on " + dayOfWeek + "s. Please select a day when this doctor has an active schedule.");
        }

        boolean withinWorkingHours = false;
        StringBuilder workingHoursInfo = new StringBuilder();
        for (DoctorSchedule s : daySchedules) {
            if (workingHoursInfo.length() > 0) workingHoursInfo.append(", ");
            workingHoursInfo.append(s.getStartTime()).append(" - ").append(s.getEndTime());

            // Check if start >= schedule.start && end <= schedule.end
            if (!startTime.isBefore(s.getStartTime()) && !endTime.isAfter(s.getEndTime())) {
                withinWorkingHours = true;
                break;
            }
        }

        if (!withinWorkingHours) {
            throw new BadRequestException("Requested time (" + startTime + " - " + endTime + ") is outside Dr. " +
                    doctor.getFullName() + "'s working hours on " + dayOfWeek + " (" + workingHoursInfo + ").");
        }

        // 2. Prevent overlapping appointments for the same doctor
        List<Appointment> existingAppointments = appointmentRepository.findActiveByDoctorAndDate(doctor.getId(), date);
        for (Appointment app : existingAppointments) {
            if (excludeAppointmentId != null && app.getId().equals(excludeAppointmentId)) {
                continue;
            }
            // Check time overlap: (startA < endB && endA > startB)
            if (startTime.isBefore(app.getEndTime()) && endTime.isAfter(app.getStartTime())) {
                throw new BadRequestException("Overlapping appointment conflict: Dr. " + doctor.getFullName() +
                        " already has an appointment scheduled from " + app.getStartTime() + " to " + app.getEndTime() +
                        " on " + date + ".");
            }
        }
    }
}
