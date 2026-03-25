package com.school.onlinetest.service;

import com.school.onlinetest.entity.*;
import com.school.onlinetest.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

    @Transactional
    @SuppressWarnings("unchecked")
    public Test createTest(Map<String, Object> req, Long userId) {
        // Parse optional datetime fields
        LocalDateTime startsAt = null;
        LocalDateTime endsAt = null;
        if (req.get("startsAt") != null && !req.get("startsAt").toString().isBlank()) {
            startsAt = LocalDateTime.parse(req.get("startsAt").toString());
        }
        if (req.get("endsAt") != null && !req.get("endsAt").toString().isBlank()) {
            endsAt = LocalDateTime.parse(req.get("endsAt").toString());
        }

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
                .startsAt(startsAt)
                .endsAt(endsAt)
                .build();

        // Parse and attach questions from the request
        List<Map<String, Object>> questionList = (List<Map<String, Object>>) req.get("questions");
        if (questionList != null && !questionList.isEmpty()) {
            List<Question> questions = new ArrayList<>();
            for (Map<String, Object> qMap : questionList) {
                Question q = Question.builder()
                        .test(test)
                        .questionText((String) qMap.get("questionText"))
                        .optionA((String) qMap.get("optionA"))
                        .optionB((String) qMap.get("optionB"))
                        .optionC((String) qMap.get("optionC"))
                        .optionD((String) qMap.get("optionD"))
                        .correctOption((String) qMap.get("correctOption"))
                        .marks(qMap.get("marks") != null ? Integer.parseInt(qMap.get("marks").toString()) : 1)
                        .orderIndex(qMap.get("orderIndex") != null ? Integer.parseInt(qMap.get("orderIndex").toString()) : null)
                        .build();
                questions.add(q);
            }
            test.setQuestions(questions);
        }

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
