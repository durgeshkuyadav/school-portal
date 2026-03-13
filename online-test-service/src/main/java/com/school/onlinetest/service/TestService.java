package com.school.onlinetest.service;

import com.school.onlinetest.entity.*;
import com.school.onlinetest.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TestService {

    private final TestRepository testRepository;
    private final TestAttemptRepository attemptRepository;

    public List<Test> getAvailableTests(Long classId) {
        if (classId != null) return testRepository.findByClassIdAndIsActiveTrue(classId);
        return testRepository.findAll().stream().filter(t -> Boolean.TRUE.equals(t.getIsActive())).toList();
    }

    public Test getTestById(Long id) {
        return testRepository.findById(id).orElseThrow(() -> new RuntimeException("Test not found: " + id));
    }

    public Test createTest(Map<String, Object> req, Long userId) {
        Test test = Test.builder()
                .title((String) req.get("title"))
                .subjectName((String) req.get("subjectName"))
                .classId(req.get("classId") != null ? Long.parseLong(req.get("classId").toString()) : null)
                .subjectId(req.get("subjectId") != null ? Long.parseLong(req.get("subjectId").toString()) : null)
                .durationMinutes(req.get("durationMinutes") != null ? Integer.parseInt(req.get("durationMinutes").toString()) : 30)
                .totalMarks(req.get("totalMarks") != null ? Integer.parseInt(req.get("totalMarks").toString()) : 10)
                .passingMarks(req.get("passingMarks") != null ? Integer.parseInt(req.get("passingMarks").toString()) : 5)
                .createdByUserId(userId)
                .isActive(true)
                .build();
        return testRepository.save(test);
    }

    public TestAttempt startAttempt(Long testId, Long studentId) {
        // Check not already attempted
        attemptRepository.findByTestIdAndStudentId(testId, studentId).ifPresent(a -> {
            throw new RuntimeException("Already attempted this test");
        });
        Test test = getTestById(testId);
        TestAttempt attempt = TestAttempt.builder()
                .testId(testId)
                .testTitle(test.getTitle())
                .studentId(studentId)
                .status("STARTED")
                .startedAt(LocalDateTime.now())
                .totalMarks(test.getTotalMarks())
                .build();
        return attemptRepository.save(attempt);
    }

    public TestAttempt submitAttempt(Long testId, Long attemptId, Long studentId, Map<String, String> answers) {
        TestAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));
        Test test = getTestById(testId);

        // Auto-grade: compare answers to correct options
        int score = 0;
        if (test.getQuestions() != null) {
            for (Question q : test.getQuestions()) {
                String given = answers.get(String.valueOf(q.getId()));
                if (given != null && given.equalsIgnoreCase(q.getCorrectOption())) {
                    score += q.getMarks() != null ? q.getMarks() : 1;
                }
            }
        }

        double pct = test.getTotalMarks() > 0 ? (score * 100.0 / test.getTotalMarks()) : 0;
        attempt.setScore(score);
        attempt.setPercentage(pct);
        attempt.setPassed(score >= (test.getPassingMarks() != null ? test.getPassingMarks() : 0));
        attempt.setStatus("SUBMITTED");
        attempt.setSubmittedAt(LocalDateTime.now());
        return attemptRepository.save(attempt);
    }

    public List<TestAttempt> getStudentAttempts(Long studentId) {
        return attemptRepository.findByStudentId(studentId);
    }

    public List<TestAttempt> getTestResults(Long testId) {
        return attemptRepository.findByTestId(testId);
    }
}
