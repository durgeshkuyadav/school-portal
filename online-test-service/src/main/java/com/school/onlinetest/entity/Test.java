package com.school.onlinetest.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Test {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String subjectName;
    private Long classId;
    private Long subjectId;
    private Long createdByUserId;

    private Integer durationMinutes;
    private Integer totalMarks;
    private Integer passingMarks;

    private Boolean isActive = true;
    private LocalDateTime startsAt;
    private LocalDateTime endsAt;
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "test", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Question> questions;

    @PrePersist
    public void prePersist() { this.createdAt = LocalDateTime.now(); }
}
