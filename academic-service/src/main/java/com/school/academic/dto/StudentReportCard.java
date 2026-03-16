package com.school.academic.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StudentReportCard {
    private Long studentId;
    private String studentName;
    private String academicYear;
    private String className;
    private List<SubjectSummary> subjects;
    private double overallPercentage;
    private String overallGrade;
}
