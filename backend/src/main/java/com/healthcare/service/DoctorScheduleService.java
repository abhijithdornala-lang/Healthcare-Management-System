package com.healthcare.service;

import com.healthcare.dto.DoctorScheduleRequestDto;
import com.healthcare.entity.Doctor;
import com.healthcare.entity.DoctorSchedule;
import com.healthcare.exception.BadRequestException;
import com.healthcare.exception.ResourceNotFoundException;
import com.healthcare.repository.DoctorRepository;
import com.healthcare.repository.DoctorScheduleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

@Service
@Transactional
public class DoctorScheduleService {

    private final DoctorScheduleRepository scheduleRepository;
    private final DoctorRepository doctorRepository;

    public DoctorScheduleService(DoctorScheduleRepository scheduleRepository, DoctorRepository doctorRepository) {
        this.scheduleRepository = scheduleRepository;
        this.doctorRepository = doctorRepository;
    }

    @Transactional(readOnly = true)
    public List<DoctorSchedule> getAllSchedules(Long doctorId) {
        if (doctorId != null) {
            return scheduleRepository.findByDoctorId(doctorId);
        }
        return scheduleRepository.findAll();
    }

    @Transactional(readOnly = true)
    public DoctorSchedule getScheduleById(Long id) {
        return scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with ID: " + id));
    }

    public DoctorSchedule createSchedule(DoctorScheduleRequestDto dto) {
        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + dto.getDoctorId()));

        String normalizedDay = validateDayOfWeek(dto.getDayOfWeek());
        validateTimeRange(dto.getStartTime(), dto.getEndTime());
        validateScheduleOverlap(doctor.getId(), normalizedDay, dto.getStartTime(), dto.getEndTime(), null);

        DoctorSchedule schedule = new DoctorSchedule();
        schedule.setDoctor(doctor);
        schedule.setDayOfWeek(normalizedDay);
        schedule.setStartTime(dto.getStartTime());
        schedule.setEndTime(dto.getEndTime());

        return scheduleRepository.save(schedule);
    }

    public DoctorSchedule updateSchedule(Long id, DoctorScheduleRequestDto dto) {
        DoctorSchedule existing = getScheduleById(id);

        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + dto.getDoctorId()));

        String normalizedDay = validateDayOfWeek(dto.getDayOfWeek());
        validateTimeRange(dto.getStartTime(), dto.getEndTime());
        validateScheduleOverlap(doctor.getId(), normalizedDay, dto.getStartTime(), dto.getEndTime(), id);

        existing.setDoctor(doctor);
        existing.setDayOfWeek(normalizedDay);
        existing.setStartTime(dto.getStartTime());
        existing.setEndTime(dto.getEndTime());

        return scheduleRepository.save(existing);
    }

    public void deleteSchedule(Long id) {
        DoctorSchedule existing = getScheduleById(id);
        scheduleRepository.delete(existing);
    }

    private String validateDayOfWeek(String day) {
        if (day == null || day.trim().isEmpty()) {
            throw new BadRequestException("Day of week cannot be empty");
        }
        String upperDay = day.trim().toUpperCase();
        try {
            DayOfWeek.valueOf(upperDay);
            return upperDay;
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid day of week: '" + day + "'. Expected MONDAY, TUESDAY, etc.");
        }
    }

    private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (startTime == null || endTime == null) {
            throw new BadRequestException("Start time and end time are required");
        }
        if (!startTime.isBefore(endTime)) {
            throw new BadRequestException("Start time (" + startTime + ") must be before end time (" + endTime + ")");
        }
    }

    private void validateScheduleOverlap(Long doctorId, String dayOfWeek, LocalTime startTime, LocalTime endTime, Long excludeScheduleId) {
        List<DoctorSchedule> daySchedules = scheduleRepository.findByDoctorIdAndDayOfWeek(doctorId, dayOfWeek);
        for (DoctorSchedule s : daySchedules) {
            if (excludeScheduleId != null && s.getId().equals(excludeScheduleId)) {
                continue;
            }
            // Check time overlap: (startA < endB && endA > startB)
            if (startTime.isBefore(s.getEndTime()) && endTime.isAfter(s.getStartTime())) {
                throw new BadRequestException("Conflicting schedule: Doctor already has an active schedule on " +
                        dayOfWeek + " from " + s.getStartTime() + " to " + s.getEndTime());
            }
        }
    }
}
