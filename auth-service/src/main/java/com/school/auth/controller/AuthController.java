package com.school.auth.controller;

import com.school.auth.dto.*;
import com.school.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest req) {
        return ResponseEntity.ok(authService.refreshToken(req));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody RefreshRequest req) {
        authService.logout(req.getRefreshToken());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/register")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerUser(req));
    }

    // ── Auto-create student login (called by student-service) ────
    @PostMapping("/auto-create/student")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ResponseEntity<UserCreatedResponse> autoCreateStudent(
            @RequestBody AutoCreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(authService.autoCreateStudentUser(req));
    }

    // ── Auto-create teacher login (called by teacher-service) ────
    @PostMapping("/auto-create/teacher")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ResponseEntity<UserCreatedResponse> autoCreateTeacher(
            @RequestBody AutoCreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(authService.autoCreateTeacherUser(req));
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(
        @RequestHeader("X-User-Id") Long userId,
        @Valid @RequestBody ChangePasswordRequest req) {
        authService.changePassword(userId, req);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long userId) {
        return ResponseEntity.ok(authService.getUserById(userId));
    }

    // ── Check if any student credentials conflict with teachers ──
    @GetMapping("/check-conflicts")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    @Operation(summary = "Check if any student ID/password matches a teacher's")
    public ResponseEntity<java.util.Map<String, Object>> checkCredentialConflicts() {
        return ResponseEntity.ok(authService.checkCredentialConflicts());
    }
}
