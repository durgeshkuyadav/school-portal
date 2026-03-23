package com.school.attendance.controller;

import com.school.attendance.dto.AttendanceDtos.*;
import com.school.attendance.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    // ── TEACHER: Mark whole class attendance ──────────────────────
    @PostMapping("/bulk")
    public ResponseEntity<List<AttendanceResponse>> markBulk(
            @RequestBody BulkAttendanceRequest req,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader(value = "X-User-Name", defaultValue = "Teacher") String userName) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(attendanceService.markBulkAttendance(req, Long.parseLong(userId), userName));
    }

    // ── TEACHER/ADMIN: Get class attendance for a date ────────────
    @GetMapping("/class/{classId}/date/{date}")
    public ResponseEntity<ClassDaySummary> getClassByDate(
            @PathVariable Long classId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getClassAttendanceByDate(classId, date));
    }

    // ── TEACHER/ADMIN: Today's attendance status ──────────────────
    @GetMapping("/class/{classId}/today")
    public ResponseEntity<Map<String, Object>> getTodayStatus(@PathVariable Long classId) {
        return ResponseEntity.ok(attendanceService.getTodayStatus(classId));
    }

    // ── STUDENT/PARENT: Student attendance summary ────────────────
    @GetMapping("/student/{studentId}/summary")
    public ResponseEntity<StudentSummary> getStudentSummary(
            @PathVariable Long studentId,
            @RequestParam(required = false) Long classId,
            @RequestParam(defaultValue = "") String from,
            @RequestParam(defaultValue = "") String to) {
        LocalDate fromDate = from.isEmpty() ? LocalDate.now().withDayOfMonth(1) : LocalDate.parse(from);
        LocalDate toDate   = to.isEmpty()   ? LocalDate.now()                  : LocalDate.parse(to);
        return ResponseEntity.ok(
            attendanceService.getStudentSummary(studentId, classId, fromDate, toDate));
    }

    // ── STUDENT/PARENT: Student attendance list (calendar) ────────
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AttendanceResponse>> getStudentList(
            @PathVariable Long studentId,
            @RequestParam(defaultValue = "") String from,
            @RequestParam(defaultValue = "") String to) {
        LocalDate fromDate = from.isEmpty() ? LocalDate.now().withDayOfMonth(1) : LocalDate.parse(from);
        LocalDate toDate   = to.isEmpty()   ? LocalDate.now()                  : LocalDate.parse(to);
        return ResponseEntity.ok(
            attendanceService.getStudentAttendanceList(studentId, fromDate, toDate));
    }

    // ── ADMIN: Monthly report for a class ─────────────────────────
    @GetMapping("/class/{classId}/report")
    public ResponseEntity<List<MonthlyReportRow>> getMonthlyReport(
            @PathVariable Long classId,
            @RequestParam(defaultValue = "0") int month,
            @RequestParam(defaultValue = "0") int year) {
        int m = month == 0 ? LocalDate.now().getMonthValue() : month;
        int y = year  == 0 ? LocalDate.now().getYear()       : year;
        return ResponseEntity.ok(attendanceService.getMonthlyReport(classId, m, y));
    }
}
