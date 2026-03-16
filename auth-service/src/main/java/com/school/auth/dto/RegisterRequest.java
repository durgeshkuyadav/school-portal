package com.school.auth.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

// ── RegisterRequest ──────────────────────────────────────────────
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RegisterRequest {
    @NotBlank private String username;
    @NotBlank @Email private String email;
    @NotBlank @Size(min = 8) private String password;
    @NotBlank private String role;
    private Long profileId;
    private Long classId;
    private String subjectIds;
}
