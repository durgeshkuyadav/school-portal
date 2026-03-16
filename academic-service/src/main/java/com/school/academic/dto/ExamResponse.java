package com.school.academic.dto;

import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExamResponse {
    private Long id;
    private String name;
    private String examType;
    private Long classId;
    private String className;
    private Long subjectId;
    private String subjectName;
    private Integer totalMarks;
    private Integer passingMarks;
    private LocalDate examDate;
    private String academicYear;
    private boolean resultsPublished;
}
