package com.school.auth.config;

import com.school.auth.entity.User;
import com.school.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * DataSeeder — App start hote hi default users create karta hai
 * Default credentials:
 *   SUPER_ADMIN  : admin / admin123
 *   SCHOOL_ADMIN : principal / principal123
 *   CLASS_TEACHER: teacher1 / teacher123
 *   STUDENT      : student1 / student123
 *   PARENT       : parent1  / parent123
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUser("admin",     "admin@school.com",      "admin123",      User.Role.SUPER_ADMIN,   null, null);
        seedUser("principal", "principal@school.com",  "principal123",  User.Role.SCHOOL_ADMIN,  null, null);
        seedUser("teacher1",  "teacher1@school.com",   "teacher123",    User.Role.CLASS_TEACHER,  1L, null);
        seedUser("teacher2",  "teacher2@school.com",   "teacher123",    User.Role.SUBJECT_TEACHER,1L, "1,2");
        seedUser("student1",  "student1@school.com",   "student123",    User.Role.STUDENT,        1L, null);
        seedUser("parent1",   "parent1@school.com",    "parent123",     User.Role.PARENT,         null, null);
        log.info("✅ DataSeeder complete. Default users created.");
    }

    private void seedUser(String username, String email, String password,
                          User.Role role, Long classId, String subjectIds) {
        if (userRepository.existsByUsername(username)) return;
        userRepository.save(User.builder()
            .username(username).email(email)
            .password(passwordEncoder.encode(password))
            .role(role).classId(classId).subjectIds(subjectIds)
            .enabled(true).accountNonLocked(true).build());
        log.info("  Created user: {} ({})", username, role);
    }
}
