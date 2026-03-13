package com.school.academic.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SaveResultRequest {
    @NotNull  private Long studentId;
    @NotBlank private String studentName;
    @NotNull  private Integer marksObtained;
    private String remarks;
    private String status;  // PASS, FAIL, ABSENT
}
