package com.school.onlinetest.controller;

import com.school.onlinetest.entity.*;
import com.school.onlinetest.service.TestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tests")
@RequiredArgsConstructor
public class TestController {

    private final TestService testService;

    /** STUDENT — get available tests for their class */
    @GetMapping("/available")
    public ResponseEntity<List<Test>> getAvailableTests(
            @RequestHeader(value = "X-Class-Id", required = false) String classId) {
        Long cid = (classId != null && !classId.isBlank()) ? Long.parseLong(classId) : null;
        return ResponseEntity.ok(testService.getAvailableTests(cid));
    }

    /** STUDENT/TEACHER — get test by ID */
    @GetMapping("/{id}")
    public ResponseEntity<Test> getById(@PathVariable Long id) {
        return ResponseEntity.ok(testService.getTestById(id));
    }

    /** TEACHER — create test */
    @PostMapping
    public ResponseEntity<Test> create(
            @RequestBody Map<String, Object> req,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(testService.createTest(req, Long.parseLong(userId)));
    }

    /** STUDENT — start a test attempt */
    @PostMapping("/{testId}/attempt")
    public ResponseEntity<TestAttempt> startAttempt(
            @PathVariable Long testId,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(testService.startAttempt(testId, Long.parseLong(userId)));
    }

    /** STUDENT — submit attempt with answers */
    @PostMapping("/{testId}/attempt/{attemptId}/submit")
    public ResponseEntity<TestAttempt> submit(
            @PathVariable Long testId,
            @PathVariable Long attemptId,
            @RequestHeader("X-User-Id") String userId,
            @RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        Map<String, String> answers = (Map<String, String>) body.get("answers");
        return ResponseEntity.ok(testService.submitAttempt(testId, attemptId, Long.parseLong(userId), answers));
    }

    /** STUDENT — get my past attempts */
    @GetMapping("/my-attempts")
    public ResponseEntity<List<TestAttempt>> getMyAttempts(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(testService.getStudentAttempts(Long.parseLong(userId)));
    }

    /** TEACHER — get all results for a test */
    @GetMapping("/{testId}/results")
    public ResponseEntity<List<TestAttempt>> getTestResults(@PathVariable Long testId) {
        return ResponseEntity.ok(testService.getTestResults(testId));
    }
}
