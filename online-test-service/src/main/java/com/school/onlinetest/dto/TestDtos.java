package com.school.onlinetest.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class TestDtos {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateTestRequest {
        private String title;
        private String subjectName;
        private Long classId;
        private Long subjectId;
        private Integer durationMinutes;
        private Integer totalMarks;
        private Integer passingMarks;
        private LocalDateTime startsAt;
        private LocalDateTime endsAt;
        private List<CreateQuestionRequest> questions;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateQuestionRequest {
        private String questionText;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private String correctOption;
        private Integer marks;
        private Integer orderIndex;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SubmitAttemptRequest {
        private Map<String, String> answers;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class TestSummaryResponse {
        private Long id;
        private String title;
        private String subjectName;
        private Long classId;
        private Integer durationMinutes;
        private Integer totalMarks;
        private Integer passingMarks;
        private Boolean isActive;
        private LocalDateTime startsAt;
        private LocalDateTime endsAt;
        private Integer questionCount;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AttemptResultResponse {
        private Long attemptId;
        private Long testId;
        private String testTitle;
        private Integer score;
        private Integer totalMarks;
        private Double percentage;
        private Boolean passed;
        private String status;
        private LocalDateTime submittedAt;
    }
}
