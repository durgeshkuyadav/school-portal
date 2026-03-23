package com.school.attendance.service;

import com.school.attendance.dto.AttendanceDtos.*;
import com.school.attendance.entity.Attendance;
import com.school.attendance.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceService {

    private final AttendanceRepository repo;

    // ── 1. Bulk mark attendance (teacher marks whole class) ────────
    @Transactional
    public List<AttendanceResponse> markBulkAttendance(
            BulkAttendanceRequest req,
            Long teacherId,
            String teacherName) {

        LocalDate date = LocalDate.parse(req.getDate());
        List<AttendanceResponse> results = new ArrayList<>();

        for (StudentAttendanceEntry entry : req.getStudents()) {
            // Upsert — agar pehle se hai toh update karo
            Attendance record = repo
                .findByStudentIdAndClassIdAndAttendanceDate(
                    entry.getStudentId(), req.getClassId(), date)
                .orElse(Attendance.builder()
                    .studentId(entry.getStudentId())
                    .classId(req.getClassId())
                    .className(req.getClassName())
                    .attendanceDate(date)
                    .build());

            record.setStudentName(entry.getStudentName());
            record.setStatus(Attendance.AttendanceStatus.valueOf(entry.getStatus()));
            record.setRemarks(entry.getRemarks());
            record.setMarkedByUserId(teacherId);
            record.setMarkedByName(teacherName);

            results.add(mapToResponse(repo.save(record)));
        }
        log.info("✅ Attendance marked for class {} on {} by {}",
            req.getClassId(), date, teacherName);
        return results;
    }

    // ── 2. Get class attendance for a specific date ────────────────
    public ClassDaySummary getClassAttendanceByDate(Long classId, LocalDate date) {
        List<Attendance> records = repo.findByClassIdAndAttendanceDate(classId, date);
        boolean marked = repo.existsByClassIdAndAttendanceDate(classId, date);

        long present = records.stream().filter(r -> r.getStatus() == Attendance.AttendanceStatus.PRESENT).count();
        long absent  = records.stream().filter(r -> r.getStatus() == Attendance.AttendanceStatus.ABSENT).count();
        long late    = records.stream().filter(r -> r.getStatus() == Attendance.AttendanceStatus.LATE).count();

        return ClassDaySummary.builder()
            .classId(classId)
            .date(date)
            .totalStudents(records.size())
            .present((int) present)
            .absent((int) absent)
            .late((int) late)
            .alreadyMarked(marked)
            .records(records.stream().map(this::mapToResponse).collect(Collectors.toList()))
            .build();
    }

    // ── 3. Get student attendance summary (percentage) ─────────────
    public StudentSummary getStudentSummary(Long studentId, Long classId,
                                             LocalDate from, LocalDate to) {
        List<Attendance> records = repo
            .findByStudentIdAndAttendanceDateBetweenOrderByAttendanceDateDesc(
                studentId, from, to);

        int present  = (int) records.stream().filter(r -> r.getStatus() == Attendance.AttendanceStatus.PRESENT).count();
        int absent   = (int) records.stream().filter(r -> r.getStatus() == Attendance.AttendanceStatus.ABSENT).count();
        int late     = (int) records.stream().filter(r -> r.getStatus() == Attendance.AttendanceStatus.LATE).count();
        int halfDay  = (int) records.stream().filter(r -> r.getStatus() == Attendance.AttendanceStatus.HALF_DAY).count();
        int total    = records.size();

        double pct = total > 0 ? ((present + late * 0.5 + halfDay * 0.5) / total * 100.0) : 0;

        String status = pct >= 75 ? "GOOD" : pct >= 60 ? "WARNING" : "CRITICAL";
        String name   = records.isEmpty() ? "" : records.get(0).getStudentName();

        return StudentSummary.builder()
            .studentId(studentId)
            .studentName(name)
            .classId(classId)
            .totalDays(total)
            .presentDays(present)
            .absentDays(absent)
            .lateDays(late)
            .halfDays(halfDay)
            .attendancePercentage(Math.round(pct * 10.0) / 10.0)
            .status(status)
            .build();
    }

    // ── 4. Get student attendance list (for calendar view) ─────────
    public List<AttendanceResponse> getStudentAttendanceList(
            Long studentId, LocalDate from, LocalDate to) {
        return repo.findByStudentIdAndAttendanceDateBetweenOrderByAttendanceDateDesc(
                studentId, from, to)
            .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // ── 5. Monthly report for a class ─────────────────────────────
    public List<MonthlyReportRow> getMonthlyReport(Long classId, int month, int year) {
        List<Attendance> all = repo.findByClassAndMonth(classId, month, year);

        // Working days = unique dates
        long workingDays = all.stream()
            .map(Attendance::getAttendanceDate)
            .distinct().count();

        // Group by student
        Map<Long, List<Attendance>> byStudent = all.stream()
            .collect(Collectors.groupingBy(Attendance::getStudentId));

        return byStudent.entrySet().stream().map(entry -> {
            List<Attendance> sr = entry.getValue();
            int present = (int) sr.stream().filter(r -> r.getStatus() == Attendance.AttendanceStatus.PRESENT).count();
            int absent  = (int) sr.stream().filter(r -> r.getStatus() == Attendance.AttendanceStatus.ABSENT).count();
            int late    = (int) sr.stream().filter(r -> r.getStatus() == Attendance.AttendanceStatus.LATE).count();
            double pct  = workingDays > 0 ? (present * 100.0 / workingDays) : 0;
            return MonthlyReportRow.builder()
                .studentId(entry.getKey())
                .studentName(sr.get(0).getStudentName())
                .presentDays(present)
                .absentDays(absent)
                .lateDays(late)
                .totalWorkingDays((int) workingDays)
                .percentage(Math.round(pct * 10.0) / 10.0)
                .build();
        }).sorted(Comparator.comparing(MonthlyReportRow::getStudentName))
          .collect(Collectors.toList());
    }

    // ── 6. Today's attendance status for a class ───────────────────
    public Map<String, Object> getTodayStatus(Long classId) {
        LocalDate today = LocalDate.now();
        boolean marked = repo.existsByClassIdAndAttendanceDate(classId, today);
        List<Attendance> records = repo.findByClassIdAndAttendanceDate(classId, today);
        long absent = records.stream().filter(r -> r.getStatus() == Attendance.AttendanceStatus.ABSENT).count();
        return Map.of(
            "date", today.toString(),
            "marked", marked,
            "totalMarked", records.size(),
            "absentCount", absent
        );
    }

    // ── Helper ─────────────────────────────────────────────────────
    private AttendanceResponse mapToResponse(Attendance a) {
        return AttendanceResponse.builder()
            .id(a.getId())
            .studentId(a.getStudentId())
            .studentName(a.getStudentName())
            .classId(a.getClassId())
            .className(a.getClassName())
            .attendanceDate(a.getAttendanceDate())
            .status(a.getStatus().name())
            .remarks(a.getRemarks())
            .markedByName(a.getMarkedByName())
            .build();
    }
}
