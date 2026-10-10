package com.healthcare.dto;

/**
 * Data Transfer Object for Dashboard Summary Statistics.
 */
public class DashboardStatsDto {

    private long totalPatients;
    private long totalDoctors;
    private long todayAppointments;
    private long upcomingAppointments;

    public DashboardStatsDto() {
    }

    public DashboardStatsDto(long totalPatients, long totalDoctors, long todayAppointments, long upcomingAppointments) {
        this.totalPatients = totalPatients;
        this.totalDoctors = totalDoctors;
        this.todayAppointments = todayAppointments;
        this.upcomingAppointments = upcomingAppointments;
    }

    public long getTotalPatients() {
        return totalPatients;
    }

    public void setTotalPatients(long totalPatients) {
        this.totalPatients = totalPatients;
    }

    public long getTotalDoctors() {
        return totalDoctors;
    }

    public void setTotalDoctors(long totalDoctors) {
        this.totalDoctors = totalDoctors;
    }

    public long getTodayAppointments() {
        return todayAppointments;
    }

    public void setTodayAppointments(long todayAppointments) {
        this.todayAppointments = todayAppointments;
    }

    public long getUpcomingAppointments() {
        return upcomingAppointments;
    }

    public void setUpcomingAppointments(long upcomingAppointments) {
        this.upcomingAppointments = upcomingAppointments;
    }
}
