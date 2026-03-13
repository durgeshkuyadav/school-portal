package com.school.academic.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SubjectSummary {
    private String subjectName;
    private Integer totalMarks;
    private Integer marksObtained;
    private double percentage;
    private String grade;
}
