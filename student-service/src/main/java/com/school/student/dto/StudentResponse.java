package com.school.student.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

// ── StudentResponse ──────────────────────────────────────────────
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StudentResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String admissionNumber;
    private LocalDate dateOfBirth;
    private String gender;
    private String photoUrl;
    private String guardianName;
    private String guardianPhone;
    private Long classId;
    private String className;
    private String section;
    private Integer rollNumber;
    private String academicYear;
    private String status;
}
