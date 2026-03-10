CREATE DATABASE IF NOT EXISTS course_management;
USE course_management;

CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,          -- bcrypt hashed
    role        ENUM('student', 'teacher') NOT NULL DEFAULT 'student',
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS courses (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    code        VARCHAR(20)  NOT NULL UNIQUE,
    credits     INT          NOT NULL CHECK (credits > 0),
    created_by  INT          NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_courses_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS enrollments (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    course_id   INT NOT NULL,
    student_id  INT NOT NULL,
    enrolled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_enrollment (course_id, student_id),
    CONSTRAINT fk_enroll_course  FOREIGN KEY (course_id)  REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT fk_enroll_student FOREIGN KEY (student_id) REFERENCES users(id)   ON DELETE CASCADE
);


INSERT INTO users (username, email, password, role) VALUES
('teacher_john', 'john@school.edu',
 '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'teacher'),
('student_jane', 'jane@school.edu',
 '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'student');
