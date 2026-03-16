package com.school.academic.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ResultResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long examId;
    private String examName;
    private String subjectName;
    private Integer totalMarks;
    private Integer marksObtained;
    private String grade;
    private String status;
    private Boolean examCleared;
    private String remarks;
}
