package com.school.academic.controller;

import com.school.academic.dto.*;
import com.school.academic.service.AcademicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/academic")
@RequiredArgsConstructor
public class AcademicController {

    private final AcademicService academicService;

    // ── EXAMS ────────────────────────────────────────────────────

    @PostMapping("/exams")
    public ResponseEntity<ExamResponse> createExam(
            @RequestBody CreateExamRequest req,
            @RequestHeader("X-User-Id") String teacherId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(academicService.createExam(req, Long.parseLong(teacherId)));
    }

    @GetMapping("/exams/class/{classId}")
    public ResponseEntity<List<ExamResponse>> getExamsByClass(
            @PathVariable Long classId,
            // ✅ FIX: was "2025-26" — frontend sends "2025-2026", must match
            @RequestParam(defaultValue = "2025-2026") String year) {
        return ResponseEntity.ok(academicService.getExamsByClass(classId, year));
    }

    @GetMapping("/exams/subject/{subjectId}/class/{classId}")
    public ResponseEntity<List<ExamResponse>> getExamsBySubjectAndClass(
            @PathVariable Long subjectId, @PathVariable Long classId) {
        return ResponseEntity.ok(academicService.getExamsBySubjectAndClass(subjectId, classId));
    }

    // ── RESULTS ──────────────────────────────────────────────────

    @PostMapping("/exams/{examId}/results")
    public ResponseEntity<ResultResponse> saveResult(
            @PathVariable Long examId,
            @RequestBody SaveResultRequest req,
            @RequestHeader("X-User-Id") String teacherId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(academicService.saveResult(examId, req, Long.parseLong(teacherId)));
    }

    @PostMapping("/exams/{examId}/results/bulk")
    public ResponseEntity<Void> bulkSaveResults(
            @PathVariable Long examId,
            @RequestBody List<SaveResultRequest> requests,
            @RequestHeader("X-User-Id") String teacherId) {
        academicService.bulkSaveResults(examId, requests, Long.parseLong(teacherId));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/exams/{examId}/publish")
    public ResponseEntity<Void> publishResults(
            @PathVariable Long examId,
            @RequestHeader("X-User-Id") String teacherId) {
        academicService.publishResults(examId, Long.parseLong(teacherId));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/exams/{examId}/results")
    public ResponseEntity<List<ResultResponse>> getClassResults(@PathVariable Long examId) {
        return ResponseEntity.ok(academicService.getClassResults(examId));
    }

    @GetMapping("/results/student/{studentId}")
    public ResponseEntity<List<ResultResponse>> getStudentResults(
            @PathVariable Long studentId,
            // ✅ FIX: was "2025-26" — frontend StudentResults.jsx sends "2025-2026"
            @RequestParam(defaultValue = "2025-2026") String year) {
        return ResponseEntity.ok(academicService.getStudentResults(studentId, year));
    }

    @GetMapping("/report-card/{studentId}")
    public ResponseEntity<StudentReportCard> getReportCard(
            @PathVariable Long studentId,
            // ✅ FIX: was "2025-26" — frontend sends "2025-2026"
            @RequestParam(defaultValue = "2025-2026") String year) {
        return ResponseEntity.ok(academicService.generateReportCard(studentId, year));
    }
}