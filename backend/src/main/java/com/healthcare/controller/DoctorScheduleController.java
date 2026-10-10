package com.healthcare.controller;

import com.healthcare.dto.DoctorScheduleRequestDto;
import com.healthcare.entity.DoctorSchedule;
import com.healthcare.service.DoctorScheduleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@CrossOrigin(origins = "*")
public class DoctorScheduleController {

    private final DoctorScheduleService scheduleService;

    public DoctorScheduleService getScheduleService() {
        return scheduleService;
    }

    public DoctorScheduleController(DoctorScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping
    public ResponseEntity<List<DoctorSchedule>> getAllSchedules(@RequestParam(required = false) Long doctorId) {
        List<DoctorSchedule> schedules = scheduleService.getAllSchedules(doctorId);
        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorSchedule> getScheduleById(@PathVariable Long id) {
        DoctorSchedule schedule = scheduleService.getScheduleById(id);
        return ResponseEntity.ok(schedule);
    }

    @PostMapping
    public ResponseEntity<DoctorSchedule> createSchedule(@Valid @RequestBody DoctorScheduleRequestDto dto) {
        DoctorSchedule created = scheduleService.createSchedule(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DoctorSchedule> updateSchedule(@PathVariable Long id, @Valid @RequestBody DoctorScheduleRequestDto dto) {
        DoctorSchedule updated = scheduleService.updateSchedule(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long id) {
        scheduleService.deleteSchedule(id);
        return ResponseEntity.noContent().build();
    }
}
