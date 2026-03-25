package com.school.auth.service;

import com.school.auth.dto.*;
import com.school.auth.entity.RefreshToken;
import com.school.auth.entity.User;
import com.school.auth.exception.AuthException;
import com.school.auth.repository.RefreshTokenRepository;
import com.school.auth.repository.UserRepository;
import com.school.auth.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Isolation;

import java.time.Instant;
import java.time.Year;
import java.util.UUID;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    public AuthService(UserRepository userRepository, RefreshTokenRepository refreshTokenRepository,
                   JwtService jwtService, PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.refreshTokenRepository = refreshTokenRepository;
    this.jwtService = jwtService;
    this.passwordEncoder = passwordEncoder;
}

    @Value("${app.jwt.refresh-expiry-ms}")
    private long refreshExpiryMs;

    // ── Login ────────────────────────────────────────────────────
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new AuthException("Invalid username or password"));

        if (!user.isEnabled())          throw new AuthException("Account is disabled");
        if (!user.isAccountNonLocked()) throw new AuthException("Account is locked");
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword()))
            throw new AuthException("Invalid username or password");

        String accessToken  = jwtService.generateToken(user);
        String refreshToken = createRefreshToken(user);

        return AuthResponse.builder()
            .accessToken(accessToken).refreshToken(refreshToken)
            .userId(user.getId()).username(user.getUsername())
            .email(user.getEmail()).role(user.getRole().name())
            .classId(user.getClassId()).build();
    }

    // ── Refresh token ────────────────────────────────────────────
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public AuthResponse refreshToken(RefreshRequest request) {
        RefreshToken rt = refreshTokenRepository.findByToken(request.getRefreshToken())
            .orElseThrow(() -> new AuthException("Invalid refresh token"));
        if (rt.isExpired()) {
            refreshTokenRepository.delete(rt);
            throw new AuthException("Refresh token expired. Please login again.");
        }
        User user = rt.getUser();
        String newAccess  = jwtService.generateToken(user);
        String newRefresh = createRefreshToken(user);
        refreshTokenRepository.delete(rt);
        return AuthResponse.builder()
            .accessToken(newAccess).refreshToken(newRefresh)
            .userId(user.getId()).username(user.getUsername())
            .email(user.getEmail()).role(user.getRole().name())
            .classId(user.getClassId()).build();
    }

    // ── Logout ──────────────────────────────────────────────────
    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken)
            .ifPresent(refreshTokenRepository::delete);
    }

    // ── Register (manual — admin sets username/pass) ─────────────
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public UserResponse registerUser(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername()))
            throw new AuthException("Username already taken");
        if (userRepository.existsByEmail(request.getEmail()))
            throw new AuthException("Email already registered");

        User user = User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .role(User.Role.valueOf(request.getRole()))
            .profileId(request.getProfileId())
            .classId(request.getClassId())
            .subjectIds(request.getSubjectIds())
            .enabled(true).accountNonLocked(true).build();

        return mapToUserResponse(userRepository.save(user));
    }

    // ── AUTO-CREATE: Admin creates student → auto login ID ───────
    // Format: STU + year(2) + sequential(3) e.g. STU26001
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public UserCreatedResponse autoCreateStudentUser(AutoCreateRequest request) {
        String year2 = String.valueOf(Year.now().getValue()).substring(2);
        String prefix = "STU" + year2;

        // Find next sequence number (thread-safe, SERIALIZABLE isolation)
        long count = userRepository.countByUsernameStartingWith(prefix);
        String username = prefix + String.format("%03d", count + 1);

        // Ensure unique even if concurrent
        while (userRepository.existsByUsername(username)) {
            count++;
            username = prefix + String.format("%03d", count + 1);
        }

        // Default password = username (student will change it)
        String rawPassword = username;

        User user = User.builder()
            .username(username)
            .email(request.getEmail() != null ? request.getEmail()
                : username.toLowerCase() + "@vidyamandir.edu.in")
            .password(passwordEncoder.encode(rawPassword))
            .role(User.Role.STUDENT)
            .profileId(request.getProfileId())
            .classId(request.getClassId())
            .enabled(true).accountNonLocked(true).build();

        User saved = userRepository.save(user);
        return UserCreatedResponse.builder()
            .userId(saved.getId())
            .username(saved.getUsername())
            .defaultPassword(rawPassword)
            .email(saved.getEmail())
            .role(saved.getRole().name())
            .message("Student login ID: " + username + " | Password: " + rawPassword)
            .build();
    }

    // ── AUTO-CREATE: Admin creates teacher → auto login ID ───────
    // Format: TCH + year(2) + sequential(3) e.g. TCH26001
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public UserCreatedResponse autoCreateTeacherUser(AutoCreateRequest request) {
        String year2 = String.valueOf(Year.now().getValue()).substring(2);
        String prefix = "TCH" + year2;

        long count = userRepository.countByUsernameStartingWith(prefix);
        String username = prefix + String.format("%03d", count + 1);

        while (userRepository.existsByUsername(username)) {
            count++;
            username = prefix + String.format("%03d", count + 1);
        }

        String rawPassword = username;

        User user = User.builder()
            .username(username)
            .email(request.getEmail() != null ? request.getEmail()
                : username.toLowerCase() + "@vidyamandir.edu.in")
            .password(passwordEncoder.encode(rawPassword))
            .role(request.getRole() != null
                ? User.Role.valueOf(request.getRole()) : User.Role.CLASS_TEACHER)
            .profileId(request.getProfileId())
            .classId(request.getClassId())
            .subjectIds(request.getSubjectIds())
            .enabled(true).accountNonLocked(true).build();

        User saved = userRepository.save(user);
        return UserCreatedResponse.builder()
            .userId(saved.getId())
            .username(saved.getUsername())
            .defaultPassword(rawPassword)
            .email(saved.getEmail())
            .role(saved.getRole().name())
            .message("Teacher login ID: " + username + " | Password: " + rawPassword)
            .build();
    }

    // ── Change password ──────────────────────────────────────────
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new AuthException("User not found"));
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword()))
            throw new AuthException("Current password is incorrect");
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    // ── Get user credentials by ID (admin use) ──────────────────
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new AuthException("User not found"));
        return mapToUserResponse(user);
    }

    // ── Check credential conflicts between students & teachers ──
    // Returns a map with conflict info: any student username == teacher username
    // or any student whose default password (same as username) matches a teacher's
    @Transactional(readOnly = true)
    public Map<String, Object> checkCredentialConflicts() {
        List<User> students = userRepository.findByRole(User.Role.STUDENT);
        List<User> teachers = new java.util.ArrayList<>();
        teachers.addAll(userRepository.findByRole(User.Role.CLASS_TEACHER));
        teachers.addAll(userRepository.findByRole(User.Role.SUBJECT_TEACHER));

        Map<String, Object> result = new HashMap<>();
        List<Map<String, String>> conflicts = new java.util.ArrayList<>();

        // Check: no student username should match any teacher username
        java.util.Set<String> teacherUsernames = new java.util.HashSet<>();
        java.util.Set<String> teacherEmails = new java.util.HashSet<>();
        for (User t : teachers) {
            teacherUsernames.add(t.getUsername());
            teacherEmails.add(t.getEmail());
        }

        for (User s : students) {
            if (teacherUsernames.contains(s.getUsername())) {
                Map<String, String> c = new HashMap<>();
                c.put("type", "USERNAME_MATCH");
                c.put("studentUsername", s.getUsername());
                c.put("message", "Student username matches a teacher username: " + s.getUsername());
                conflicts.add(c);
            }
            if (teacherEmails.contains(s.getEmail())) {
                Map<String, String> c = new HashMap<>();
                c.put("type", "EMAIL_MATCH");
                c.put("studentUsername", s.getUsername());
                c.put("studentEmail", s.getEmail());
                c.put("message", "Student email matches a teacher email: " + s.getEmail());
                conflicts.add(c);
            }
        }

        result.put("totalStudents", students.size());
        result.put("totalTeachers", teachers.size());
        result.put("conflictsFound", conflicts.size());
        result.put("conflicts", conflicts);
        result.put("safe", conflicts.isEmpty());
        result.put("message", conflicts.isEmpty()
            ? "✅ No credential conflicts. Student IDs and Teacher IDs are completely separate."
            : "⚠️ Found " + conflicts.size() + " credential conflicts!");
        return result;
    }

    // ── Helpers ─────────────────────────────────────────────────
    private String createRefreshToken(User user) {
        refreshTokenRepository.deleteByUser(user);
        RefreshToken rt = RefreshToken.builder()
            .user(user).token(UUID.randomUUID().toString())
            .expiryDate(Instant.now().plusMillis(refreshExpiryMs)).build();
        return refreshTokenRepository.save(rt).getToken();
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
            .id(user.getId()).username(user.getUsername())
            .email(user.getEmail()).role(user.getRole().name())
            .classId(user.getClassId()).enabled(user.isEnabled())
            .createdAt(user.getCreatedAt()).build();
    }
}
