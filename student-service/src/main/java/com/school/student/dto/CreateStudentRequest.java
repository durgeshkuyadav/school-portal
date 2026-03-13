package com.school.student.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateStudentRequest {
    @NotBlank private String firstName;
    @NotBlank private String lastName;
    @NotBlank private String admissionNumber;
    private LocalDate dateOfBirth;
    private String gender;
    @NotNull private Long classId;
    private String guardianName;
    private String guardianRelation;
    private String guardianPhone;
    private String guardianEmail;
    private Integer rollNumber;
    @NotBlank private String academicYear;
}
