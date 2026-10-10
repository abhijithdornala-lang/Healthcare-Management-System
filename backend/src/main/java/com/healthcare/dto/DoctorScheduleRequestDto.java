package com.healthcare.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;

/**
 * Data Transfer Object for creating or updating a Doctor Schedule.
 */
public class DoctorScheduleRequestDto {

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    @NotBlank(message = "Day of week is required")
    private String dayOfWeek;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    public DoctorScheduleRequestDto() {
    }

    public DoctorScheduleRequestDto(Long doctorId, String dayOfWeek, LocalTime startTime, LocalTime endTime) {
        this.doctorId = doctorId;
        this.dayOfWeek = dayOfWeek != null ? dayOfWeek.toUpperCase() : null;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public String getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(String dayOfWeek) {
        this.dayOfWeek = dayOfWeek != null ? dayOfWeek.toUpperCase() : null;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }
}
