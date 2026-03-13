package com.school.auth.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChangePasswordRequest {
    @NotBlank private String oldPassword;
    @NotBlank @Size(min = 8) private String newPassword;
}
