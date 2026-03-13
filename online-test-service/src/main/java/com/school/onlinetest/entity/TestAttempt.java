package com.school.onlinetest.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "test_attempts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TestAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long testId;
    private String testTitle;
    private Long studentId;

    private Integer score;
    private Integer totalMarks;
    private Double percentage;
    private Boolean passed;

    // STARTED, SUBMITTED, EVALUATED
    private String status;

    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
}
