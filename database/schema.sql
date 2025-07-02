-- Users table (teachers and admins)
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('teacher', 'admin')),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grades table
CREATE TABLE grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects table
CREATE TABLE subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Classes table
CREATE TABLE classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    grade_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    teacher_id INTEGER NOT NULL,
    room VARCHAR(50),
    schedule_time VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grade_id) REFERENCES grades(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- Students table
CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    grade_id INTEGER NOT NULL,
    date_of_birth DATE,
    parent_name VARCHAR(100),
    parent_phone VARCHAR(20),
    parent_email VARCHAR(100),
    address TEXT,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'transferred')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grade_id) REFERENCES grades(id)
);

-- Class enrollments (many-to-many relationship between students and classes)
CREATE TABLE class_enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'dropped', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    UNIQUE(student_id, class_id)
);

-- Attendance records
CREATE TABLE attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused', 'early_leave')),
    notes TEXT,
    recorded_by INTEGER NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (recorded_by) REFERENCES users(id),
    UNIQUE(student_id, class_id, date)
);

-- Sessions table for authentication
CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert default admin user (password: admin123, simple SHA-256 hash)
INSERT INTO users (username, email, password_hash, role, first_name, last_name) VALUES 
('admin', 'admin@school.edu', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin', 'System', 'Administrator');

-- Insert sample teacher user (username: teacher, password: teacher123)
INSERT INTO users (username, email, password_hash, role, first_name, last_name) VALUES 
('teacher', 'teacher@school.edu', '6ca13d52ca70c883e0f0bb101e425a89e8624de51db2d2392593af6a84118090', 'teacher', 'John', 'Teacher');

-- Insert sample grades
INSERT INTO grades (name, description) VALUES 
('Grade 1', 'First Grade'),
('Grade 2', 'Second Grade'),
('Grade 3', 'Third Grade'),
('Grade 4', 'Fourth Grade'),
('Grade 5', 'Fifth Grade'),
('Grade 6', 'Sixth Grade'),
('Grade 7', 'Seventh Grade'),
('Grade 8', 'Eighth Grade'),
('Grade 9', 'Ninth Grade'),
('Grade 10', 'Tenth Grade'),
('Grade 11', 'Eleventh Grade'),
('Grade 12', 'Twelfth Grade');

-- Insert sample subjects
INSERT INTO subjects (name, code, description) VALUES 
('Mathematics', 'MATH', 'Mathematics and Algebra'),
('English Language Arts', 'ELA', 'English Literature and Writing'),
('Science', 'SCI', 'General Science'),
('History', 'HIST', 'World and Local History'),
('Physical Education', 'PE', 'Physical Education and Sports'),
('Art', 'ART', 'Visual Arts and Creativity'),
('Music', 'MUS', 'Music Theory and Practice'),
('Computer Science', 'CS', 'Programming and Digital Literacy');

-- Insert sample classes (teacher user has id 2)
INSERT INTO classes (name, grade_id, subject_id, teacher_id, room, schedule_time) VALUES 
('Math 101', 9, 1, 2, 'Room 201', '9:00 AM'),
('English 101', 9, 2, 2, 'Room 105', '10:00 AM'),
('Science 101', 9, 3, 2, 'Lab 1', '2:00 PM');

-- Insert sample students
INSERT INTO students (student_id, first_name, last_name, email, grade_id, parent_name, parent_phone) VALUES 
('STU001', 'Alice', 'Johnson', 'alice.johnson@email.com', 9, 'Mary Johnson', '555-0101'),
('STU002', 'Bob', 'Smith', 'bob.smith@email.com', 9, 'Robert Smith', '555-0102'),
('STU003', 'Carol', 'Williams', 'carol.williams@email.com', 9, 'Linda Williams', '555-0103'),
('STU004', 'David', 'Brown', 'david.brown@email.com', 9, 'James Brown', '555-0104'),
('STU005', 'Emma', 'Davis', 'emma.davis@email.com', 9, 'Susan Davis', '555-0105');

-- Enroll students in classes
INSERT INTO class_enrollments (student_id, class_id) VALUES 
(1, 1), (1, 2), (1, 3),
(2, 1), (2, 2), (2, 3),
(3, 1), (3, 2), (3, 3),
(4, 1), (4, 2), (4, 3),
(5, 1), (5, 2), (5, 3); 