package com.school.auth.dto;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AutoCreateRequest {
    private String email;
    private String role;        // CLASS_TEACHER, SUBJECT_TEACHER, STUDENT
    private Long profileId;     // teacher/student table ID
    private Long classId;
    private String subjectIds;
}
