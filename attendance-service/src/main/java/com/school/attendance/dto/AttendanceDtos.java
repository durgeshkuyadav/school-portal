package com.school.attendance.dto;

import com.school.attendance.entity.Attendance;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

public class AttendanceDtos {

    // ── Request: Teacher ek student ka status submit kare ─────────
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class StudentAttendanceEntry {
        private Long studentId;
        private String studentName;
        private String status;   // PRESENT, ABSENT, LATE, HALF_DAY
        private String remarks;
    }

    // ── Request: Bulk — poori class ek saath ──────────────────────
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class BulkAttendanceRequest {
        private Long classId;
        private String className;
        private String date;          // "2026-03-23"
        private List<StudentAttendanceEntry> students;
    }

    // ── Response: Single record ────────────────────────────────────
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AttendanceResponse {
        private Long id;
        private Long studentId;
        private String studentName;
        private Long classId;
        private String className;
        private LocalDate attendanceDate;
        private String status;
        private String remarks;
        private String markedByName;
    }

    // ── Response: Student summary (% present) ─────────────────────
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class StudentSummary {
        private Long studentId;
        private String studentName;
        private Long classId;
        private String className;
        private int totalDays;
        private int presentDays;
        private int absentDays;
        private int lateDays;
        private int halfDays;
        private double attendancePercentage;
        private String status;          // GOOD / WARNING / CRITICAL
    }

    // ── Response: Class summary for a date ────────────────────────
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ClassDaySummary {
        private Long classId;
        private String className;
        private LocalDate date;
        private int totalStudents;
        private int present;
        private int absent;
        private int late;
        private boolean alreadyMarked;
        private List<AttendanceResponse> records;
    }

    // ── Response: Monthly report row ──────────────────────────────
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MonthlyReportRow {
        private Long studentId;
        private String studentName;
        private int presentDays;
        private int absentDays;
        private int lateDays;
        private int totalWorkingDays;
        private double percentage;
    }
}
