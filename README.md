# Healthcare Management System (HMS)

A complete, production-ready, full-stack **Healthcare Management System** designed and built for a B.Tech college project.

The system is built using:
- **Frontend**: Clean, semantic HTML5, modern CSS3 (with responsive layouts, glassmorphism, micro-animations, and CSS custom properties), and Vanilla JavaScript (Fetch API).
- **Backend**: Java 17+ with Spring Boot 3.3.4 (Spring Web, Spring Data JPA, Hibernate, Bean Validation).
- **Database**: MySQL 8.0+ with relational integrity, foreign keys, and indexes.

---

## 1. System Architecture & Features

### Core Modules
1. **Executive Dashboard (`index.html`)**
   - Live summary metrics: Total Registered Patients, Total Doctors, Today's Appointments, Upcoming Appointments.
   - Real-time today's appointments schedule preview table.
   - Doctor roster availability overview.
   - Live system clock and quick navigation to all modules.

2. **Patient Management (`patients.html`)**
   - Register new patients with full validation (Full Name, Age, Gender, Phone, Email, Address, Registration Date).
   - View complete list of registered patients.
   - Search patients in real time by name or Patient ID.
   - View individual patient profile details in an accessible modal dialog.
   - Edit existing patient records.
   - Delete patients (cascades cleanly to related appointments).

3. **Doctor Management (`doctors.html`)**
   - Add new medical specialists (Full Name, Specialization, Phone, Email, Availability Status).
   - View all registered doctors.
   - Filter and search doctors by name or medical specialty.
   - Update doctor information and availability (`Available`, `Busy`, `On Leave`).
   - Delete doctors.

4. **Appointment Management (`appointments.html`)**
   - Book appointments linking patients with doctors.
   - Comprehensive multi-attribute filtering: by Date, Attending Doctor, Patient, and Status (`Scheduled`, `Completed`, `Cancelled`).
   - Reschedule appointments (change date, start time, end time, notes).
   - Cancel appointments (`PATCH /api/appointments/{id}/cancel`).
   - View complete appointment information dialog.
   - **Backend Conflict Detection**:
     - Prevents overlapping appointments for the same doctor.
     - Prevents bookings outside the doctor's active working schedule.
     - Blocks bookings for doctors marked `On Leave`.

5. **Doctor Schedule Management (`schedules.html`)**
   - Configure doctor shifts for each day of the week (`MONDAY` through `SUNDAY`).
   - Define shift start times and end times.
   - Filter schedules by doctor.
   - **Backend Conflict Prevention**: Prevents overlapping shift schedules for the same doctor on the same day, and enforces `startTime < endTime`.

---

## 2. Project Directory Structure

```text
healthcare-management-system/
├── frontend/                     # Standalone frontend files
│   ├── index.html                # Main Dashboard
│   ├── patients.html             # Patient Management
│   ├── doctors.html              # Doctor Management
│   ├── appointments.html         # Appointment Management
│   ├── schedules.html            # Doctor Schedule Management
│   ├── css/
│   │   └── style.css             # Unified CSS Design System
│   └── js/
│       ├── dashboard.js          # Dashboard API calls & live clock
│       ├── patients.js           # Patient CRUD & search
│       ├── doctors.js            # Doctor CRUD & search
│       ├── appointments.js       # Appointment booking, filters & reschedule
│       └── schedules.js          # Schedule configuration & validation
├── backend/                      # Java Spring Boot application
│   ├── pom.xml                   # Maven dependencies & build config
│   ├── mvnw / mvnw.cmd           # Maven Wrapper
│   ├── .mvn/wrapper/             # Wrapper configuration
│   └── src/
│       └── main/
│           ├── java/com/healthcare/
│           │   ├── HealthcareApplication.java  # Main application entry point
│           │   ├── config/WebConfig.java       # Static file routing & CORS
│           │   ├── entity/                     # JPA Entities (Patient, Doctor, DoctorSchedule, Appointment)
│           │   ├── repository/                 # Spring Data JPA Repositories
│           │   ├── service/                    # Business logic & conflict validations
│           │   ├── controller/                 # REST API Controllers
│           │   ├── dto/                        # Data Transfer Objects
│           │   └── exception/                  # Global Exception Handling & ErrorResponse
│           └── resources/
│               ├── application.properties      # Database & server configuration
│               └── static/                     # Frontend bundled directly with backend
├── database/
│   └── healthcare_management.sql # Complete MySQL database schema & seed data
├── .gitignore
└── README.md
```

---

## 3. Prerequisites & Installation

### Required Software
1. **Java Development Kit (JDK)**: JDK 17, 21, or newer.
   - Verify installation:
     ```powershell
     java -version
     ```
2. **MySQL Server**: MySQL 8.0 or newer.
   - Ensure MySQL service is running on `localhost:3306`.
3. **Apache Maven**: Maven 3.8+ (or use the included Maven Wrapper `mvnw.cmd`).

---

## 4. Database Setup

1. Open MySQL Command Line, MySQL Workbench, or PowerShell:
2. Run the provided database initialization script located at `database/healthcare_management.sql`:

   Using MySQL CLI:
   ```cmd
   mysql -u root -p < database/healthcare_management.sql
   ```
   *(If root has no password, simply omit `-p`)*

   Or open MySQL Workbench, load `database/healthcare_management.sql`, and execute all statements.

3. The script:
   - Creates the `healthcare_management` database.
   - Creates the `patients`, `doctors`, `doctor_schedules`, and `appointments` tables with foreign keys and indexes.
   - Inserts realistic initial seed data for doctors, patients, weekly schedules, and sample appointments.

---

## 5. Configuration (`application.properties`)

The database connection is defined in `backend/src/main/resources/application.properties`. You can override credentials using environment variables or modify the file:

```properties
server.port=8080

spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:mysql://localhost:3306/healthcare_management?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME:root}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
```

---

## 6. How to Start the Application

### Option A: Using Maven CLI (Recommended)

1. Open a terminal or PowerShell in the `healthcare-management-system/backend` directory:
   ```powershell
   cd healthcare-management-system/backend
   ```
2. Run the application:
   ```powershell
   mvn spring-boot:run
   ```
   *(Or using the full path if Maven is in your user profile: `& "$env:USERPROFILE\apache-maven-3.9.9\bin\mvn.cmd" spring-boot:run`)*

3. Spring Boot will start embedded Tomcat on **port 8080**:
   ```text
   Tomcat started on port 8080 (http) with context path '/'
   Healthcare Management System Started Successfully!
   ```

---

## 7. How to Open the Frontend

The Spring Boot backend serves the frontend directly as static resources. No separate web server (like Nginx, Live Server, or Apache) is required, eliminating all CORS issues.

Open any modern browser (Chrome, Edge, Firefox) and navigate to:
```text
http://localhost:8080/
```
or
```text
http://localhost:8080/index.html
```

You can also navigate directly to individual pages:
- **Dashboard**: `http://localhost:8080/index.html`
- **Patient Management**: `http://localhost:8080/patients.html`
- **Doctor Management**: `http://localhost:8080/doctors.html`
- **Appointment Management**: `http://localhost:8080/appointments.html`
- **Doctor Schedules**: `http://localhost:8080/schedules.html`

---

## 8. REST API Reference

| Resource | Method | Endpoint | Description |
|---|---|---|---|
| **Dashboard** | `GET` | `/api/dashboard/stats` | Returns total patients, total doctors, today's and upcoming appointments |
| **Patients** | `GET` | `/api/patients` | Get all patients (optional `?search=...` by name or ID) |
| | `GET` | `/api/patients/{id}` | Get patient details by ID |
| | `POST` | `/api/patients` | Register a new patient |
| | `PUT` | `/api/patients/{id}` | Update existing patient record |
| | `DELETE` | `/api/patients/{id}` | Delete a patient |
| **Doctors** | `GET` | `/api/doctors` | Get all doctors (optional `?search=...` by name or specialty) |
| | `GET` | `/api/doctors/{id}` | Get doctor details by ID |
| | `POST` | `/api/doctors` | Register a new doctor |
| | `PUT` | `/api/doctors/{id}` | Update doctor record & availability |
| | `DELETE` | `/api/doctors/{id}` | Delete doctor |
| **Schedules** | `GET` | `/api/schedules` | Get all schedules (optional `?doctorId=...`) |
| | `GET` | `/api/schedules/{id}` | Get schedule by ID |
| | `POST` | `/api/schedules` | Create a doctor weekly shift |
| | `PUT` | `/api/schedules/{id}` | Update a schedule |
| | `DELETE` | `/api/schedules/{id}` | Delete a schedule |
| **Appointments** | `GET` | `/api/appointments` | Filter by `date`, `doctorId`, `patientId`, `status` |
| | `GET` | `/api/appointments/{id}` | Get appointment details by ID |
| | `POST` | `/api/appointments` | Book a new appointment |
| | `PUT` | `/api/appointments/{id}` | Reschedule / update appointment |
| | `PATCH` | `/api/appointments/{id}/cancel`| Cancel an appointment |

---

## 9. Feature Verification & Testing Guide

### 1. Testing Dashboard Statistics
1. Open `http://localhost:8080/index.html`.
2. Verify the 4 cards display real numbers from MySQL (e.g., Total Patients: 7, Total Doctors: 5, Today's Appointments: 3, Upcoming Appointments: 4).
3. Confirm today's schedule table displays active appointments.

### 2. Testing Patient Management
1. Click **Patients** in the sidebar.
2. Click **+ Register New Patient**. Fill in Name, Age, Gender, Phone, Email, Address, Registration Date. Click **Save Patient**.
3. Verify the new patient appears immediately in the table and count increments.
4. Type the patient's name into the search bar and click **Search**. Confirm instant filtering.
5. Click the **Eye icon** to view full patient details in the modal.
6. Click the **Pencil icon** to edit the patient's phone number or address.
7. Click the **Trash icon** to delete the patient.

### 3. Testing Doctor Management
1. Click **Doctors** in the sidebar.
2. Click **+ Add Doctor**. Enter doctor details with specialization and status (`Available`, `Busy`, `On Leave`).
3. Verify the doctor appears in the table with the corresponding color-coded status badge.
4. Search by specialty (e.g. `Cardiology`) and observe filtered results.

### 4. Testing Doctor Schedules
1. Click **Doctor Schedules** in the sidebar.
2. Filter schedules by selecting a doctor from the dropdown.
3. Click **+ Add Schedule**. Configure a shift for a doctor (e.g., Monday 09:00 to 17:00).
4. **Validation Test**: Attempt adding another schedule for the same doctor on Monday from 10:00 to 14:00. Verify the system displays an error blocking the conflicting shift.

### 5. Testing Appointment Booking & Conflict Validation
1. Click **Appointments** in the sidebar.
2. Click **+ Book New Appointment**.
3. Select a patient and doctor, choose an appointment date.
4. **Schedule Validation Test**: Choose a day on which the selected doctor has no schedule, or a time outside their shift (e.g. 21:00). Click **Confirm Booking**.
   - Notice the backend error response clearly informs: *"Requested time is outside Dr. [Name]'s working hours on [Day]"*.
5. Select a valid time slot within the doctor's schedule. Confirm booking.
6. **Overlap Validation Test**: Attempt booking another appointment with the same doctor at an overlapping time on the same date.
   - Notice the backend blocks the booking with *"Overlapping appointment conflict: Dr. [Name] already has an appointment scheduled from..."*.
7. In the table, click the **Cancel icon** next to an appointment. Confirm the status changes to `Cancelled` (red badge).
8. Use the filter bar to filter appointments by Status (`Cancelled`), Attending Doctor, or Patient.

---

## 10. College Project Notes

- **Simplicity & Cleanliness**: The codebase follows standard enterprise Spring Boot architecture (`Controller -> Service -> Repository -> Entity`), making it straightforward to explain during viva and project presentations.
- **Pure Technologies**: No third-party frontend frameworks (no React/Vue/Node.js) and no complex security boilerplate, adhering strictly to the university specification.
- **Real Database Persistence**: All changes persist in MySQL tables with real ACID transactions and foreign key constraints.
