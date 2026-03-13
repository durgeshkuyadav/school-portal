package com.school.student.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Task — Admin assigns tasks to Teachers, Principal, etc.
 * Priority: LOW, MEDIUM, HIGH, URGENT
 * Status:   PENDING, IN_PROGRESS, COMPLETED, CANCELLED
 */
@Entity
@Table(name = "tasks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Who assigned this task (userId from auth-service)
    private Long assignedByUserId;
    private String assignedByName;
    private String assignedByRole;

    // Who it's assigned to (userId from auth-service)
    private Long assignedToUserId;
    private String assignedToName;
    private String assignedToRole;   // e.g. CLASS_TEACHER, SCHOOL_ADMIN

    // Metadata
    private String priority;         // LOW, MEDIUM, HIGH, URGENT
    private String status;           // PENDING, IN_PROGRESS, COMPLETED, CANCELLED
    private String category;         // ACADEMIC, ADMINISTRATIVE, EVENT, OTHER

    private LocalDate dueDate;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Column(columnDefinition = "TEXT")
    private String completionNote;   // Teacher writes when marking complete

    @Column(columnDefinition = "TEXT")
    private String adminRemark;      // Admin feedback after review

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) this.status = "PENDING";
        if (this.priority == null) this.priority = "MEDIUM";
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
