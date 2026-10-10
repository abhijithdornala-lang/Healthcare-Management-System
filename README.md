#  Healthcare Management System

A full-stack Healthcare Management System designed to simplify hospital operations by managing patients, doctors, appointments, and doctor schedules through a centralized application.

##  About the Project

The Healthcare Management System is a college project focused on solving real-world healthcare administration problems. It provides a user-friendly interface for organizing essential hospital information and managing daily administrative activities efficiently.

The application combines a Java Spring Boot backend, a MySQL database, and a responsive web interface. It also includes an Electron-based desktop application structure.

##  Features

* **Dashboard:** View an overview of hospital activities.
* **Patient Management:** Add, view, update, and manage patient information.
* **Doctor Management:** Maintain doctor details and availability.
* **Appointment Management:** Schedule and manage patient appointments.
* **Doctor Schedules:** Organize and manage doctors' schedules.
* **Database Integration:** Store and manage application data using MySQL.
* **REST API:** Connect the frontend with backend services.
* **Desktop Application:** Electron integration for a Windows desktop experience.

##  Technology Stack

| Technology     | Purpose                                |
| -------------- | -------------------------------------- |
| Java           | Backend programming                    |
| Spring Boot    | Backend framework and REST APIs        |
| MySQL          | Relational database                    |
| HTML5          | Web page structure                     |
| CSS3           | Styling and responsive layouts         |
| JavaScript     | Frontend interactions                  |
| Maven          | Java project and dependency management |
| Electron       | Desktop application framework          |
| Git and GitHub | Version control and project hosting    |

## Project Architecture

The application follows a layered architecture:

* **Frontend Layer:** Provides the user interface and handles user interactions.
* **Controller Layer:** Receives HTTP requests and exposes REST endpoints.
* **Service Layer:** Handles application logic and processing.
* **Repository Layer:** Communicates with the database.
* **Entity Layer:** Represents the application's database entities.
* **Database Layer:** Stores patients, doctors, appointments, and schedules.

## Project Structure

```text
Healthcare-Management-System/
├── backend/
│   ├── src/main/java/com/healthcare/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── entity/
│   │   ├── exception/
│   │   ├── repository/
│   │   └── service/
│   ├── src/main/resources/
│   │   ├── static/
│   │   └── application.properties
│   ├── pom.xml
│   └── mvnw
├── database/
│   └── healthcare_management.sql
├── desktop/
│   ├── electron.js
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── css/
│   ├── js/
│   └── HTML pages
├── .gitignore
└── README.md
```

##  Application Workflow

1. The user interacts with the application through the interface.
2. The frontend sends requests to the Spring Boot backend.
3. Controllers receive requests and pass them to the service layer.
4. Services process the requested operations.
5. Repositories communicate with the MySQL database.
6. The backend returns responses to the frontend.
7. The interface displays the updated information.

##  Project Objectives

* Simplify routine hospital administration.
* Organize patient and doctor information.
* Improve appointment and schedule management.
* Demonstrate full-stack application development.
* Apply database management and REST API concepts to a real-world problem.
* Explore desktop application development using Electron.

##  Data Management

The application uses MySQL for persistent data storage and Spring Boot for backend processing. Database credentials can be configured through environment variables rather than hard-coded into the source code.

**Note:** This project is intended for educational and demonstration purposes. It should not be used to store real patient information without appropriate security, privacy, and compliance measures.

##  Future Enhancements

* Role-based access control for administrators and healthcare staff.
* Improved authentication and authorization.
* Enhanced input validation and error handling.
* Automated testing and deployment.
* Additional reporting features where appropriate.

Project Information

**Project Name:** Healthcare Management System

**Project Type:** Full-Stack Web and Desktop Application

**Domain:** Healthcare Administration

**Purpose:** Academic project and real-world problem-solving demonstration

##  License

No license has been specified for this project. All rights are reserved by the project owner unless a license is added to the repository.
