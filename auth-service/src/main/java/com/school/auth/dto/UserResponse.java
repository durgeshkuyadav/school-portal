package com.school.auth.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String role;
    private Long classId;
    private boolean enabled;
    private LocalDateTime createdAt;
}
