package com.school.academic.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

// ── CreateExamRequest ────────────────────────────────────────────
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateExamRequest {
    @NotBlank private String name;
    @NotBlank private String examType;         // UNIT_TEST, MID_TERM, FINAL, etc.
    @NotNull  private Long classId;
    @NotNull  private Long subjectId;
    @NotBlank private String subjectName;
    @NotBlank private String className;
    @NotNull  private Integer totalMarks;
    @NotNull  private Integer passingMarks;
    private LocalDate examDate;
    @NotBlank private String academicYear;
}
