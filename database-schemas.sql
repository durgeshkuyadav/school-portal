-- ═══════════════════════════════════════════════════════════════════
-- SCHOOL PORTAL — DATABASE SCHEMAS (MySQL 8.0)
-- ✅ FIX: Was PostgreSQL syntax (BIGSERIAL). All services use MySQL 8.0.
-- NOTE: Since all services use spring.jpa.hibernate.ddl-auto=update,
--       Hibernate creates the tables automatically. This file is for
--       reference / manual setup only.
-- ═══════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- school_auth database
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    profile_id BIGINT,
    class_id BIGINT,
    subject_ids TEXT,
    school_id VARCHAR(50),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    account_non_locked BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(512) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    expiry_date DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- school_student database
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS school_classes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    section VARCHAR(5),
    academic_year VARCHAR(10) NOT NULL,
    class_teacher_id BIGINT,
    capacity INT NOT NULL DEFAULT 40
);

CREATE TABLE IF NOT EXISTS students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    admission_number VARCHAR(30) UNIQUE NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10),
    photo_url TEXT,
    address TEXT,
    blood_group VARCHAR(5),
    guardian_name VARCHAR(100),
    guardian_relation VARCHAR(50),
    guardian_phone VARCHAR(20),
    guardian_email VARCHAR(100),
    class_id BIGINT NOT NULL,
    roll_number INT NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_class_roll_year (class_id, roll_number, academic_year),
    FOREIGN KEY (class_id) REFERENCES school_classes(id)
);

CREATE TABLE IF NOT EXISTS tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_by_user_id BIGINT,
    assigned_by_name VARCHAR(100),
    assigned_by_role VARCHAR(50),
    assigned_to_user_id BIGINT,
    assigned_to_name VARCHAR(100),
    assigned_to_role VARCHAR(50),
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    status VARCHAR(20) DEFAULT 'PENDING',
    category VARCHAR(50) DEFAULT 'ADMINISTRATIVE',
    due_date DATE,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completion_note TEXT,
    admin_remark TEXT
);

-- ─────────────────────────────────────────────
-- school_academic database
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exams (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    exam_type VARCHAR(30) NOT NULL,
    class_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    subject_name VARCHAR(100),
    class_name VARCHAR(50),
    total_marks INT NOT NULL,
    passing_marks INT NOT NULL,
    exam_date DATE NOT NULL,
    -- ✅ academic_year stored as '2025-2026' format — must match frontend
    academic_year VARCHAR(10) NOT NULL,
    created_by_teacher_id BIGINT,
    results_published TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    student_name VARCHAR(100),
    marks_obtained INT NOT NULL,
    grade VARCHAR(3),
    status VARCHAR(15),
    exam_cleared TINYINT(1),
    remarks TEXT,
    updated_by_teacher_id BIGINT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_exam_student (exam_id, student_id),
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- school_teacher database
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teachers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    designation VARCHAR(100),
    qualification VARCHAR(200),
    subjects_taught TEXT,
    profile_photo_url TEXT,
    joining_date DATE,
    is_active TINYINT(1) DEFAULT 1,
    show_in_directory TINYINT(1) DEFAULT 1,
    bio TEXT
);

-- ─────────────────────────────────────────────
-- school_calendar database
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS calendar_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    -- ✅ FIX: CalendarEvent entity uses eventDate (LocalDate), was start_date TIMESTAMP in old schema
    event_date DATE NOT NULL,
    event_type VARCHAR(50),
    is_holiday TINYINT(1) DEFAULT 0,
    is_public TINYINT(1) DEFAULT 1,
    created_by_user_id BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- school_test database (Online Tests)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    subject_name VARCHAR(100),
    class_id BIGINT,
    subject_id BIGINT,
    created_by_user_id BIGINT,
    duration_minutes INT,
    total_marks INT,
    passing_marks INT,
    is_active TINYINT(1) DEFAULT 1,
    starts_at DATETIME,
    ends_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    test_id BIGINT NOT NULL,
    question_text TEXT NOT NULL,
    option_a TEXT, option_b TEXT, option_c TEXT, option_d TEXT,
    correct_option VARCHAR(10) NOT NULL,
    marks INT DEFAULT 1,
    order_index INT,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS test_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    test_id BIGINT NOT NULL,
    test_title VARCHAR(200),
    student_id BIGINT NOT NULL,
    score INT,
    total_marks INT,
    percentage DECIMAL(5,2),
    passed TINYINT(1),
    status VARCHAR(20) DEFAULT 'STARTED',
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    submitted_at DATETIME,
    FOREIGN KEY (test_id) REFERENCES tests(id)
);