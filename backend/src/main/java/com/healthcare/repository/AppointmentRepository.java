package com.healthcare.repository;

import com.healthcare.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    /**
     * Find active (non-cancelled) appointments for doctor on specific date to validate conflicts.
     */
    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId " +
           "AND a.appointmentDate = :date " +
           "AND a.status != 'Cancelled'")
    List<Appointment> findActiveByDoctorAndDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);

    /**
     * Filter appointments by optional criteria.
     */
    @Query("SELECT a FROM Appointment a WHERE " +
           "(:date IS NULL OR a.appointmentDate = :date) AND " +
           "(:doctorId IS NULL OR a.doctor.id = :doctorId) AND " +
           "(:patientId IS NULL OR a.patient.id = :patientId) AND " +
           "(:status IS NULL OR LOWER(a.status) = LOWER(:status)) " +
           "ORDER BY a.appointmentDate DESC, a.startTime ASC")
    List<Appointment> filterAppointments(
            @Param("date") LocalDate date,
            @Param("doctorId") Long doctorId,
            @Param("patientId") Long patientId,
            @Param("status") String status
    );

    /**
     * Count appointments on a specific date (today's appointments).
     */
    long countByAppointmentDate(LocalDate date);

    /**
     * Count upcoming appointments (dates after specified date).
     */
    long countByAppointmentDateGreaterThan(LocalDate date);
}
