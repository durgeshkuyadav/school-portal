-- ═══════════════════════════════════════════════════════════════════
-- SCHOOL PORTAL — DUMMY TEST DATA
-- Run this AFTER the services have started and created tables via Hibernate
-- 
-- USAGE:
--   1. Start all services (docker-compose up -d)
--   2. Wait for health checks to pass
--   3. Run these inserts against the respective databases
--
-- PASSWORDS: All passwords are BCrypt hash of the username itself
-- (default behavior of auto-create). The hash below = "admin123"
-- BCrypt hash for "admin123": $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- ═══════════════════════════════════════════════════════════════════

-- =============================================
-- 1. AUTH DATABASE (school_auth / mysql-auth:3307)
-- =============================================
USE school_auth;

-- Admin user (password: admin123)
INSERT INTO users (username, email, password, role, profile_id, class_id, subject_ids, school_id, enabled, account_non_locked) VALUES
('admin',     'admin@vidyamandir.edu.in',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'SUPER_ADMIN',     NULL, NULL, NULL, 'VM001', true, true),
('schooladmin','schooladmin@vidyamandir.edu.in','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'SCHOOL_ADMIN',    NULL, NULL, NULL, 'VM001', true, true);

-- Teachers (password: same as username for each)
-- BCrypt of "TCH26001": $2a$10$dXJ3SW6G7P50lGmMQgel5uJ4fOXo2wLLN7oGKR3iFyelGB1Gv2Pia
-- For simplicity, using "admin123" hash for all dummy users
INSERT INTO users (username, email, password, role, profile_id, class_id, subject_ids, school_id, enabled, account_non_locked) VALUES
('TCH26001', 'priya.sharma@vidyamandir.edu.in',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'CLASS_TEACHER',   1, 1, '1,2',   'VM001', true, true),
('TCH26002', 'rahul.verma@vidyamandir.edu.in',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'SUBJECT_TEACHER', 2, NULL, '1',  'VM001', true, true),
('TCH26003', 'sunita.yadav@vidyamandir.edu.in',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'CLASS_TEACHER',   3, 2, '3,4',   'VM001', true, true),
('TCH26004', 'anil.gupta@vidyamandir.edu.in',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'SUBJECT_TEACHER', 4, NULL, '5',  'VM001', true, true);

-- Students (password: same as username for each)
INSERT INTO users (username, email, password, role, profile_id, class_id, subject_ids, school_id, enabled, account_non_locked) VALUES
('STU26001', 'aarav.kumar@vidyamandir.edu.in',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STUDENT', 1, 1, NULL, 'VM001', true, true),
('STU26002', 'priya.patel@vidyamandir.edu.in',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STUDENT', 2, 1, NULL, 'VM001', true, true),
('STU26003', 'rohan.singh@vidyamandir.edu.in',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STUDENT', 3, 1, NULL, 'VM001', true, true),
('STU26004', 'meera.joshi@vidyamandir.edu.in',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STUDENT', 4, 2, NULL, 'VM001', true, true),
('STU26005', 'arjun.mishra@vidyamandir.edu.in',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STUDENT', 5, 2, NULL, 'VM001', true, true),
('STU26006', 'kavya.sharma@vidyamandir.edu.in',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STUDENT', 6, 2, NULL, 'VM001', true, true);


-- =============================================
-- 2. STUDENT DATABASE (school_student / mysql-student:3308)
-- =============================================
USE school_student;

-- Classes
INSERT INTO school_classes (id, name, section, academic_year, class_teacher_id, capacity) VALUES
(1, 'Class 3',  'A', '2025-2026', 1, 40),
(2, 'Class 4',  'A', '2025-2026', 3, 40),
(3, 'Class 5',  'A', '2025-2026', NULL, 35),
(4, 'Class 1',  'A', '2025-2026', NULL, 30),
(5, 'Class 2',  'A', '2025-2026', NULL, 30);

-- Students
INSERT INTO students (id, first_name, last_name, admission_number, date_of_birth, gender, address, blood_group, guardian_name, guardian_relation, guardian_phone, guardian_email, class_id, roll_number, academic_year, status) VALUES
(1, 'Aarav',   'Kumar',   'ADM2026001', '2017-03-15', 'Male',   'Gomti Nagar, Lucknow',   'B+',  'Rajesh Kumar',    'Father', '9876543001', 'rajesh.k@email.com',    1, 1,  '2025-2026', 'ACTIVE'),
(2, 'Priya',   'Patel',   'ADM2026002', '2017-06-22', 'Female', 'Hazratganj, Lucknow',    'A+',  'Suresh Patel',    'Father', '9876543002', 'suresh.p@email.com',    1, 2,  '2025-2026', 'ACTIVE'),
(3, 'Rohan',   'Singh',   'ADM2026003', '2017-01-10', 'Male',   'Aliganj, Lucknow',       'O+',  'Vikram Singh',    'Father', '9876543003', 'vikram.s@email.com',    1, 3,  '2025-2026', 'ACTIVE'),
(4, 'Meera',   'Joshi',   'ADM2026004', '2016-08-05', 'Female', 'Indira Nagar, Lucknow',  'AB+', 'Amit Joshi',      'Father', '9876543004', 'amit.j@email.com',      2, 1,  '2025-2026', 'ACTIVE'),
(5, 'Arjun',   'Mishra',  'ADM2026005', '2016-11-18', 'Male',   'Mahanagar, Lucknow',     'B-',  'Sanjay Mishra',   'Father', '9876543005', 'sanjay.m@email.com',    2, 2,  '2025-2026', 'ACTIVE'),
(6, 'Kavya',   'Sharma',  'ADM2026006', '2016-04-30', 'Female', 'Vikas Nagar, Lucknow',   'A-',  'Deepak Sharma',   'Father', '9876543006', 'deepak.s@email.com',    2, 3,  '2025-2026', 'ACTIVE');

-- Tasks
INSERT INTO tasks (title, description, assigned_by_user_id, assigned_by_name, assigned_by_role, assigned_to_user_id, assigned_to_name, assigned_to_role, priority, status, category, due_date) VALUES
('Prepare Annual Day Speech',     'Write and prepare a 5-minute speech for Annual Day function',         1, 'Admin',          'SUPER_ADMIN',  3, 'Mrs. Priya Sharma', 'CLASS_TEACHER',   'HIGH',   'PENDING',    'EVENT',          '2026-04-15'),
('Submit Attendance Report',      'Submit Class 3A attendance report for March',                          1, 'Admin',          'SUPER_ADMIN',  3, 'Mrs. Priya Sharma', 'CLASS_TEACHER',   'MEDIUM', 'PENDING',    'ADMINISTRATIVE', '2026-03-31'),
('Science Exhibition Prep',       'Prepare Class 4 students for inter-school science exhibition',        1, 'Admin',          'SUPER_ADMIN',  5, 'Mrs. Sunita Yadav', 'CLASS_TEACHER',   'HIGH',   'IN_PROGRESS','ACADEMIC',       '2026-04-20'),
('Update Library Inventory',      'Physical verification of Class 3 library books',                      1, 'Admin',          'SUPER_ADMIN',  4, 'Mr. Rahul Verma',   'SUBJECT_TEACHER', 'LOW',    'PENDING',    'ADMINISTRATIVE', '2026-05-01');


-- =============================================
-- 3. TEACHER DATABASE (school_teacher / mysql-teacher:3310)
-- =============================================
USE school_teacher;

INSERT INTO teachers (id, user_id, first_name, last_name, email, phone, designation, qualification, subjects_taught, joining_date, is_active, show_in_directory, bio) VALUES
(1, 3, 'Priya',   'Sharma',  'priya.sharma@vidyamandir.edu.in',  '9876500001', 'Class Teacher - III',    'M.Ed, B.Sc',    'Mathematics, English',     '2020-06-15', 1, 1, 'Experienced primary school teacher with 6 years of teaching mathematics and English.'),
(2, 4, 'Rahul',   'Verma',   'rahul.verma@vidyamandir.edu.in',   '9876500002', 'Mathematics Teacher',    'M.Sc Mathematics', 'Mathematics',            '2019-07-01', 1, 1, 'Passionate about making math fun and accessible for young learners.'),
(3, 5, 'Sunita',  'Yadav',   'sunita.yadav@vidyamandir.edu.in',  '9876500003', 'Class Teacher - IV',     'M.A. Hindi',    'Hindi, EVS',               '2018-04-10', 1, 1, 'Dedicated teacher focusing on language development and environmental studies.'),
(4, 6, 'Anil',    'Gupta',   'anil.gupta@vidyamandir.edu.in',    '9876500004', 'Science Teacher',        'M.Sc Science',  'Science, General Knowledge','2021-01-15', 1, 1, 'Science enthusiast who loves conducting experiments with students.');


-- =============================================
-- 4. ACADEMIC DATABASE (school_academic / mysql-academic:3309)
-- =============================================
USE school_academic;

-- Exams
INSERT INTO exams (id, name, exam_type, class_id, subject_id, subject_name, class_name, total_marks, passing_marks, exam_date, academic_year, created_by_teacher_id, results_published) VALUES
(1, 'Unit Test 1 - Math',      'UNIT_TEST',   1, 1, 'Mathematics',  'Class 3A', 50,  17, '2026-01-15', '2025-2026', 1, 1),
(2, 'Unit Test 1 - English',   'UNIT_TEST',   1, 2, 'English',      'Class 3A', 50,  17, '2026-01-18', '2025-2026', 1, 1),
(3, 'Mid Term - Math',         'MID_TERM',    1, 1, 'Mathematics',  'Class 3A', 100, 33, '2026-02-20', '2025-2026', 2, 1),
(4, 'Unit Test 1 - Hindi',     'UNIT_TEST',   2, 3, 'Hindi',        'Class 4A', 50,  17, '2026-01-16', '2025-2026', 3, 1),
(5, 'Mid Term - Science',      'MID_TERM',    2, 5, 'Science',      'Class 4A', 100, 33, '2026-02-22', '2025-2026', 4, 0),
(6, 'Annual Exam - Math',      'ANNUAL',      1, 1, 'Mathematics',  'Class 3A', 100, 33, '2026-04-10', '2025-2026', 2, 0);

-- Results (for published exams)
INSERT INTO results (exam_id, student_id, student_name, marks_obtained, grade, status, exam_cleared, remarks, updated_by_teacher_id) VALUES
-- Unit Test 1 Math (Class 3)
(1, 1, 'Aarav Kumar',   42, 'A',  'PASS', 1, 'Excellent performance',       1),
(1, 2, 'Priya Patel',   38, 'B+', 'PASS', 1, 'Good effort',                 1),
(1, 3, 'Rohan Singh',   28, 'C',  'PASS', 1, 'Needs improvement in algebra', 1),
-- Unit Test 1 English (Class 3)
(2, 1, 'Aarav Kumar',   35, 'B',  'PASS', 1, 'Good grammar skills',          1),
(2, 2, 'Priya Patel',   45, 'A+', 'PASS', 1, 'Outstanding!',                 1),
(2, 3, 'Rohan Singh',   22, 'C',  'PASS', 1, 'Work on reading comprehension', 1),
-- Mid Term Math (Class 3)
(3, 1, 'Aarav Kumar',   78, 'A',  'PASS', 1, 'Very good',                    2),
(3, 2, 'Priya Patel',   65, 'B',  'PASS', 1, 'Satisfactory',                 2),
(3, 3, 'Rohan Singh',   45, 'C',  'PASS', 1, 'Needs practice',               2),
-- Unit Test 1 Hindi (Class 4)
(4, 4, 'Meera Joshi',   40, 'A',  'PASS', 1, 'Very neat handwriting too',     3),
(4, 5, 'Arjun Mishra',  32, 'B',  'PASS', 1, 'Good improvement',              3),
(4, 6, 'Kavya Sharma',  44, 'A+', 'PASS', 1, 'Topper!',                       3);


-- =============================================
-- 5. CALENDAR DATABASE (school_calendar / mysql-calendar:3311)
-- =============================================
USE school_calendar;

INSERT INTO calendar_events (title, description, event_date, event_type, is_holiday, is_public, created_by_user_id) VALUES
('Republic Day',            'National holiday – school remains closed',                    '2026-01-26', 'HOLIDAY',  1, 1, 1),
('Annual Cultural Fest',    'Dance, drama, music & art competitions for all classes',       '2026-02-14', 'CULTURAL', 0, 1, 1),
('Holi Holiday',            'Festival of Colors – school closed',                           '2026-03-14', 'HOLIDAY',  1, 1, 1),
('Staff Development Day',   'Annual staff training – school closed for students',           '2026-03-18', 'EVENT',    1, 1, 1),
('Inter-School Cricket',    'District level cricket tournament',                             '2026-03-22', 'SPORTS',   0, 1, 1),
('Annual Exams Begin',      'Classes 1–5 annual examination schedule starts',                '2026-04-10', 'EXAM',     0, 1, 1),
('Annual Exams End',        'Last day of annual examinations',                               '2026-04-25', 'EXAM',     0, 1, 1),
('Summer Vacation Starts',  'Summer break begins after exam results',                        '2026-05-01', 'HOLIDAY',  1, 1, 1),
('New Session Begins',      'Academic year 2026–27 commences with orientation',              '2026-06-05', 'EVENT',    0, 1, 1),
('Independence Day',        'Flag hoisting ceremony at 8:00 AM',                             '2026-08-15', 'HOLIDAY',  1, 1, 1),
('Teacher\'s Day',          'Special program organized by students',                          '2026-09-05', 'CULTURAL', 0, 1, 1),
('Diwali Holiday',          'Diwali celebration – school closed for 5 days',                  '2026-10-18', 'HOLIDAY',  1, 1, 1),
('Sports Day',              'Annual sports day with races, games, and prizes',                '2026-11-20', 'SPORTS',   0, 1, 1),
('Christmas Holiday',       'Christmas celebration and winter break begins',                  '2026-12-25', 'HOLIDAY',  1, 1, 1),
('PTM - Parent Teacher Meet','Quarterly parent-teacher meeting for all classes',               '2026-03-28', 'EVENT',    0, 0, 1);


-- =============================================
-- 6. ONLINE TEST DATABASE (school_test / mysql-test:3312)
-- =============================================
USE school_test;

-- Test 1: Math Quiz for Class 3
INSERT INTO tests (id, title, subject_name, class_id, subject_id, created_by_user_id, duration_minutes, total_marks, passing_marks, is_active, starts_at, ends_at) VALUES
(1, 'Math Fun Quiz - Chapter 5', 'Mathematics', 1, 1, 3, 15, 5, 2, 1, '2026-03-20 08:00:00', '2026-04-30 23:59:59');

INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index) VALUES
(1, 'What is 25 + 37?',                      '52', '62', '72', '42', 'B', 1, 1),
(1, 'Which number comes after 99?',          '98', '100', '101', '999', 'B', 1, 2),
(1, 'What is 8 × 7?',                        '54', '56', '48', '64', 'B', 1, 3),
(1, 'How many sides does a triangle have?',   '4', '3', '5', '6', 'B', 1, 4),
(1, 'What is half of 50?',                    '20', '30', '25', '15', 'C', 1, 5);

-- Test 2: Science Quiz for Class 4
INSERT INTO tests (id, title, subject_name, class_id, subject_id, created_by_user_id, duration_minutes, total_marks, passing_marks, is_active, starts_at, ends_at) VALUES
(2, 'Science Weekly Test - Plants', 'Science', 2, 5, 6, 20, 10, 4, 1, '2026-03-22 08:00:00', '2026-04-30 23:59:59');

INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index) VALUES
(2, 'Which part of the plant makes food?',            'Root', 'Stem', 'Leaf', 'Flower', 'C', 1, 1),
(2, 'What do plants need to make food?',              'Only water', 'Sunlight and water', 'Sunlight, water and CO2', 'Only sunlight', 'C', 1, 2),
(2, 'Which gas do plants release during photosynthesis?', 'Carbon dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen', 'B', 1, 3),
(2, 'What is the process of food-making in plants called?', 'Respiration', 'Photosynthesis', 'Digestion', 'Germination', 'B', 1, 4),
(2, 'Which part of the plant absorbs water?',          'Leaf', 'Flower', 'Root', 'Fruit', 'C', 1, 5),
(2, 'Seeds are formed from which part?',               'Leaf', 'Root', 'Stem', 'Flower', 'D', 1, 6),
(2, 'Which of these is NOT a part of a plant?',        'Root', 'Stem', 'Feather', 'Leaf', 'C', 1, 7),
(2, 'Plants that live for many years are called?',     'Annual', 'Biennial', 'Perennial', 'Seasonal', 'C', 1, 8),
(2, 'Cactus is found in?',                             'Water', 'Desert', 'Ice', 'Forest', 'B', 1, 9),
(2, 'The green pigment in leaves is called?',           'Melanin', 'Chlorophyll', 'Hemoglobin', 'Keratin', 'B', 1, 10);

-- Test 3: English Grammar for Class 3
INSERT INTO tests (id, title, subject_name, class_id, subject_id, created_by_user_id, duration_minutes, total_marks, passing_marks, is_active, starts_at, ends_at) VALUES
(3, 'English Grammar - Nouns & Pronouns', 'English', 1, 2, 3, 10, 5, 2, 1, '2026-03-25 08:00:00', '2026-04-30 23:59:59');

INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index) VALUES
(3, 'Which of these is a noun?',                       'Run', 'Beautiful', 'Quickly', 'Elephant', 'D', 1, 1),
(3, '"She" is an example of a?',                       'Noun', 'Verb', 'Pronoun', 'Adjective', 'C', 1, 2),
(3, 'Find the proper noun:',                           'city', 'Delhi', 'river', 'book', 'B', 1, 3),
(3, '"The cat sat on the mat." What is the noun?',     'sat', 'on', 'the', 'cat', 'D', 1, 4),
(3, 'Which pronoun replaces "Rohan"?',                 'She', 'It', 'He', 'They', 'C', 1, 5);

-- Sample test attempt (student 1 attempted test 1)
INSERT INTO test_attempts (test_id, test_title, student_id, score, total_marks, percentage, passed, status, started_at, submitted_at) VALUES
(1, 'Math Fun Quiz - Chapter 5', 1, 4, 5, 80.00, 1, 'EVALUATED', '2026-03-25 09:00:00', '2026-03-25 09:12:00');


-- =============================================
-- VERIFICATION QUERIES (run to check data)
-- =============================================
-- SELECT 'Auth Users' AS db, COUNT(*) AS cnt FROM school_auth.users
-- UNION ALL SELECT 'Classes', COUNT(*) FROM school_student.school_classes
-- UNION ALL SELECT 'Students', COUNT(*) FROM school_student.students
-- UNION ALL SELECT 'Teachers', COUNT(*) FROM school_teacher.teachers
-- UNION ALL SELECT 'Exams', COUNT(*) FROM school_academic.exams
-- UNION ALL SELECT 'Results', COUNT(*) FROM school_academic.results
-- UNION ALL SELECT 'Calendar Events', COUNT(*) FROM school_calendar.calendar_events
-- UNION ALL SELECT 'Online Tests', COUNT(*) FROM school_test.tests
-- UNION ALL SELECT 'Questions', COUNT(*) FROM school_test.questions;

-- =============================================
-- LOGIN CREDENTIALS FOR TESTING
-- =============================================
-- ┌──────────────┬──────────────┬──────────────────┐
-- │ Username     │ Password     │ Role             │
-- ├──────────────┼──────────────┼──────────────────┤
-- │ admin        │ admin123     │ SUPER_ADMIN      │
-- │ schooladmin  │ admin123     │ SCHOOL_ADMIN     │
-- │ TCH26001     │ admin123     │ CLASS_TEACHER    │
-- │ TCH26002     │ admin123     │ SUBJECT_TEACHER  │
-- │ TCH26003     │ admin123     │ CLASS_TEACHER    │
-- │ TCH26004     │ admin123     │ SUBJECT_TEACHER  │
-- │ STU26001     │ admin123     │ STUDENT          │
-- │ STU26002     │ admin123     │ STUDENT          │
-- │ STU26003     │ admin123     │ STUDENT          │
-- │ STU26004     │ admin123     │ STUDENT          │
-- │ STU26005     │ admin123     │ STUDENT          │
-- │ STU26006     │ admin123     │ STUDENT          │
-- └──────────────┴──────────────┴──────────────────┘
--
-- NOTE: Student IDs (STU*) and Teacher IDs (TCH*) use different
-- prefixes by design, so there is ZERO credential overlap.
-- Use GET /auth/check-conflicts (admin only) to verify anytime.
