-- =====================================================================
-- Healthcare Management System Database Schema & Initial Seed Data
-- Database: healthcare_management
-- Suitable for MySQL 8.0+
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `healthcare_management`
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `healthcare_management`;

-- ---------------------------------------------------------------------
-- Table structure for `patients`
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `appointments`;
DROP TABLE IF EXISTS `doctor_schedules`;
DROP TABLE IF EXISTS `patients`;
DROP TABLE IF EXISTS `doctors`;

CREATE TABLE `patients` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(100) NOT NULL,
    `age` INT NOT NULL,
    `gender` VARCHAR(20) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `registration_date` DATE NOT NULL,
    INDEX `idx_patient_name` (`full_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table structure for `doctors`
-- ---------------------------------------------------------------------
CREATE TABLE `doctors` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(100) NOT NULL,
    `specialization` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `availability_status` VARCHAR(30) NOT NULL DEFAULT 'Available',
    INDEX `idx_doctor_name` (`full_name`),
    INDEX `idx_doctor_specialization` (`specialization`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table structure for `doctor_schedules`
-- ---------------------------------------------------------------------
CREATE TABLE `doctor_schedules` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `doctor_id` BIGINT NOT NULL,
    `day_of_week` VARCHAR(20) NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    INDEX `idx_schedule_doctor_day` (`doctor_id`, `day_of_week`),
    CONSTRAINT `fk_schedule_doctor` FOREIGN KEY (`doctor_id`)
        REFERENCES `doctors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table structure for `appointments`
-- ---------------------------------------------------------------------
CREATE TABLE `appointments` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `patient_id` BIGINT NOT NULL,
    `doctor_id` BIGINT NOT NULL,
    `appointment_date` DATE NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'Scheduled',
    `notes` TEXT,
    INDEX `idx_appointment_date` (`appointment_date`),
    INDEX `idx_appointment_doctor_date` (`doctor_id`, `appointment_date`),
    CONSTRAINT `fk_appointment_patient` FOREIGN KEY (`patient_id`)
        REFERENCES `patients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_appointment_doctor` FOREIGN KEY (`doctor_id`)
        REFERENCES `doctors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Sample Data: Doctors
-- ---------------------------------------------------------------------
INSERT INTO `doctors` (`id`, `full_name`, `specialization`, `phone`, `email`, `availability_status`) VALUES
(1, 'Dr. Sarah Jenkins', 'Cardiology', '+1 555-0101', 'sarah.jenkins@hospital.org', 'Available'),
(2, 'Dr. Marcus Vance', 'Pediatrics', '+1 555-0102', 'marcus.vance@hospital.org', 'Available'),
(3, 'Dr. Emily Chen', 'Dermatology', '+1 555-0103', 'emily.chen@hospital.org', 'Available'),
(4, 'Dr. Rajesh Patel', 'Orthopedics', '+1 555-0104', 'rajesh.patel@hospital.org', 'Busy'),
(5, 'Dr. Olivia Taylor', 'General Medicine', '+1 555-0105', 'olivia.taylor@hospital.org', 'Available');

-- ---------------------------------------------------------------------
-- Sample Data: Patients
-- ---------------------------------------------------------------------
INSERT INTO `patients` (`id`, `full_name`, `age`, `gender`, `phone`, `email`, `address`, `registration_date`) VALUES
(1, 'John Doe', 34, 'Male', '+1 555-0201', 'john.doe@gmail.com', '742 Evergreen Terrace, Springfield', '2026-01-15'),
(2, 'Jane Smith', 28, 'Female', '+1 555-0202', 'jane.smith@gmail.com', '124 Conch Street, Bikini Bottom', '2026-02-10'),
(3, 'Michael Brown', 45, 'Male', '+1 555-0203', 'michael.brown@outlook.com', '221B Baker Street, Marylebone', '2026-03-01'),
(4, 'Sophia Martinez', 19, 'Female', '+1 555-0204', 'sophia.m@yahoo.com', '4 Privet Drive, Little Whinging', '2026-03-12'),
(5, 'David Wilson', 62, 'Male', '+1 555-0205', 'david.wilson@hotmail.com', '10 Downing Street, Westminster', '2026-03-20'),
(6, 'Emma Watson', 31, 'Female', '+1 555-0206', 'emma.w@gmail.com', '1600 Pennsylvania Ave, Washington', '2026-03-25'),
(7, 'Alex Johnson', 24, 'Other', '+1 555-0207', 'alex.j@icloud.com', '42 Wallaby Way, Sydney', '2026-04-01');

-- ---------------------------------------------------------------------
-- Sample Data: Doctor Schedules (MONDAY through FRIDAY)
-- ---------------------------------------------------------------------
INSERT INTO `doctor_schedules` (`id`, `doctor_id`, `day_of_week`, `start_time`, `end_time`) VALUES
-- Dr. Sarah Jenkins (Cardiology): Mon, Wed, Fri (09:00 - 17:00)
(1, 1, 'MONDAY', '09:00:00', '17:00:00'),
(2, 1, 'WEDNESDAY', '09:00:00', '17:00:00'),
(3, 1, 'FRIDAY', '09:00:00', '17:00:00'),

-- Dr. Marcus Vance (Pediatrics): Mon, Tue, Thu (08:30 - 16:30)
(4, 2, 'MONDAY', '08:30:00', '16:30:00'),
(5, 2, 'TUESDAY', '08:30:00', '16:30:00'),
(6, 2, 'THURSDAY', '08:30:00', '16:30:00'),

-- Dr. Emily Chen (Dermatology): Tue, Wed, Thu (10:00 - 18:00)
(7, 3, 'TUESDAY', '10:00:00', '18:00:00'),
(8, 3, 'WEDNESDAY', '10:00:00', '18:00:00'),
(9, 3, 'THURSDAY', '10:00:00', '18:00:00'),

-- Dr. Rajesh Patel (Orthopedics): Mon, Wed, Sat (09:00 - 15:00)
(10, 4, 'MONDAY', '09:00:00', '15:00:00'),
(11, 4, 'WEDNESDAY', '09:00:00', '15:00:00'),
(12, 4, 'SATURDAY', '09:00:00', '13:00:00'),

-- Dr. Olivia Taylor (General Medicine): Mon through Fri (08:00 - 16:00)
(13, 5, 'MONDAY', '08:00:00', '16:00:00'),
(14, 5, 'TUESDAY', '08:00:00', '16:00:00'),
(15, 5, 'WEDNESDAY', '08:00:00', '16:00:00'),
(16, 5, 'THURSDAY', '08:00:00', '16:00:00'),
(17, 5, 'FRIDAY', '08:00:00', '16:00:00');

-- ---------------------------------------------------------------------
-- Sample Data: Appointments
-- Using CURDATE() dynamically ensures today's and upcoming appointments display realistically
-- ---------------------------------------------------------------------
INSERT INTO `appointments` (`id`, `patient_id`, `doctor_id`, `appointment_date`, `start_time`, `end_time`, `status`, `notes`) VALUES
-- Today's Appointments
(1, 1, 1, CURDATE(), '09:30:00', '10:00:00', 'Scheduled', 'Routine cardiac follow-up and blood pressure check.'),
(2, 2, 5, CURDATE(), '11:00:00', '11:30:00', 'Scheduled', 'General wellness examination and flu consultation.'),
(3, 4, 3, CURDATE(), '14:00:00', '14:30:00', 'Scheduled', 'Skin rash consultation on forearm.'),

-- Upcoming Appointments
(4, 3, 4, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00', '10:30:00', 'Scheduled', 'Post-fracture recovery evaluation.'),
(5, 5, 2, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '09:00:00', '09:30:00', 'Scheduled', 'Pediatric vaccination follow-up consultation.'),
(6, 6, 1, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '14:00:00', '14:30:00', 'Scheduled', 'ECG review and chest discomfort follow-up.'),
(7, 7, 5, DATE_ADD(CURDATE(), INTERVAL 4 DAY), '13:00:00', '13:30:00', 'Scheduled', 'Annual blood test review and dietary guidance.'),

-- Past Completed / Cancelled Appointments
(8, 1, 5, DATE_SUB(CURDATE(), INTERVAL 5 DAY), '09:00:00', '09:30:00', 'Completed', 'Initial general consultation.'),
(9, 3, 1, DATE_SUB(CURDATE(), INTERVAL 3 DAY), '11:00:00', '11:30:00', 'Cancelled', 'Patient requested cancellation due to travel.');
