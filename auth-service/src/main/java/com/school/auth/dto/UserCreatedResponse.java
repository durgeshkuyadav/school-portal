package com.school.auth.dto;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserCreatedResponse {
    private Long userId;
    private String username;        // auto-generated e.g. STU26001
    private String defaultPassword; // same as username initially
    private String email;
    private String role;
    private String message;         // "Login ID: STU26001 | Password: STU26001"
}
