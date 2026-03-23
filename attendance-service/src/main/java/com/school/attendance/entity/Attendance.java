package com.school.attendance.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_records",
    uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "class_id", "attendance_date"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "student_name")
    private String studentName;

    @Column(name = "class_id", nullable = false)
    private Long classId;

    @Column(name = "class_name")
    private String className;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status;  // PRESENT, ABSENT, LATE, HOLIDAY, HALF_DAY

    private String remarks;

    @Column(name = "marked_by_user_id")
    private Long markedByUserId;

    @Column(name = "marked_by_name")
    private String markedByName;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum AttendanceStatus {
        PRESENT, ABSENT, LATE, HOLIDAY, HALF_DAY
    }
}
