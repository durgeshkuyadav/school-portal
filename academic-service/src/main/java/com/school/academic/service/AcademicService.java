package com.school.academic.service;

import com.school.academic.dto.*;
import com.school.academic.entity.*;
import com.school.academic.kafka.AcademicEventProducer;
import com.school.academic.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AcademicService {

    private final ExamRepository examRepository;
    private final ResultRepository resultRepository;
    private final AcademicEventProducer eventProducer;

    public ExamResponse createExam(CreateExamRequest req, Long teacherId) {
        Exam exam = Exam.builder()
            .name(req.getName()).examType(Exam.ExamType.valueOf(req.getExamType()))
            .classId(req.getClassId()).subjectId(req.getSubjectId())
            .subjectName(req.getSubjectName()).className(req.getClassName())
            .totalMarks(req.getTotalMarks()).passingMarks(req.getPassingMarks())
            .examDate(req.getExamDate()).academicYear(req.getAcademicYear())
            .createdByTeacherId(teacherId).resultsPublished(false).build();
        return mapExamToResponse(examRepository.save(exam));
    }

    public List<ExamResponse> getExamsByClass(Long classId, String academicYear) {
        return examRepository.findByClassIdAndAcademicYear(classId, academicYear)
            .stream().map(this::mapExamToResponse).collect(Collectors.toList());
    }

    public List<ExamResponse> getExamsBySubjectAndClass(Long subjectId, Long classId) {
        return examRepository.findBySubjectIdAndClassId(subjectId, classId)
            .stream().map(this::mapExamToResponse).collect(Collectors.toList());
    }

    @Transactional
    public ResultResponse saveResult(Long examId, SaveResultRequest req, Long teacherId) {
        Exam exam = examRepository.findById(examId)
            .orElseThrow(() -> new RuntimeException("Exam not found: " + examId));
        Result result = resultRepository.findByExamIdAndStudentId(examId, req.getStudentId())
            .orElse(Result.builder().exam(exam).studentId(req.getStudentId()).build());
        result.setMarksObtained(req.getMarksObtained());
        result.setRemarks(req.getRemarks());
        result.setStudentName(req.getStudentName());
        result.setUpdatedByTeacherId(teacherId);
        if (req.getStatus() != null) result.setStatus(Result.ResultStatus.valueOf(req.getStatus()));
        return mapResultToResponse(resultRepository.save(result));
    }

    @Transactional
    public void bulkSaveResults(Long examId, List<SaveResultRequest> requests, Long teacherId) {
        requests.forEach(req -> saveResult(examId, req, teacherId));
    }

    @Transactional
    public void publishResults(Long examId, Long teacherId) {
        Exam exam = examRepository.findById(examId)
            .orElseThrow(() -> new RuntimeException("Exam not found: " + examId));
        exam.setResultsPublished(true);
        examRepository.save(exam);
        eventProducer.publishResultsPublished(examId, exam.getClassId(), exam.getName());
    }

    public List<ResultResponse> getStudentResults(Long studentId, String academicYear) {
        return resultRepository.findByStudentIdAndAcademicYear(studentId, academicYear)
            .stream().map(this::mapResultToResponse).collect(Collectors.toList());
    }

    public List<ResultResponse> getClassResults(Long examId) {
        return resultRepository.findByExamId(examId)
            .stream().map(this::mapResultToResponse).collect(Collectors.toList());
    }

    public StudentReportCard generateReportCard(Long studentId, String academicYear) {
        List<Result> results = resultRepository.findByStudentIdAndAcademicYear(studentId, academicYear);
        Map<String, List<Result>> bySubject = results.stream()
            .collect(Collectors.groupingBy(res -> res.getExam().getSubjectName()));
        List<SubjectSummary> summaries = bySubject.entrySet().stream().map(entry -> {
            List<Result> subjectResults = entry.getValue();
            int total = subjectResults.stream().mapToInt(res -> res.getExam().getTotalMarks()).sum();
            int obtained = subjectResults.stream().mapToInt(Result::getMarksObtained).sum();
            double pct = total > 0 ? (obtained * 100.0 / total) : 0;
            return SubjectSummary.builder()
                .subjectName(entry.getKey()).totalMarks(total).marksObtained(obtained)
                .percentage(pct).grade(calculateGrade(pct)).build();
        }).collect(Collectors.toList());
        double overallPct = summaries.isEmpty() ? 0 : summaries.stream()
            .mapToDouble(s -> s.getTotalMarks() > 0 ? s.getMarksObtained() * 100.0 / s.getTotalMarks() : 0)
            .average().orElse(0);
        return StudentReportCard.builder().studentId(studentId).academicYear(academicYear)
            .subjects(summaries).overallPercentage(overallPct).overallGrade(calculateGrade(overallPct)).build();
    }

    private String calculateGrade(double pct) {
        if (pct >= 90) return "A+"; if (pct >= 80) return "A"; if (pct >= 70) return "B+";
        if (pct >= 60) return "B"; if (pct >= 50) return "C"; if (pct >= 40) return "D";
        return "F";
    }

    private ExamResponse mapExamToResponse(Exam e) {
        return ExamResponse.builder().id(e.getId()).name(e.getName())
            .examType(e.getExamType().name()).classId(e.getClassId()).className(e.getClassName())
            .subjectId(e.getSubjectId()).subjectName(e.getSubjectName())
            .totalMarks(e.getTotalMarks()).passingMarks(e.getPassingMarks())
            .examDate(e.getExamDate()).academicYear(e.getAcademicYear())
            .resultsPublished(e.isResultsPublished()).build();
    }

    private ResultResponse mapResultToResponse(Result r) {
        return ResultResponse.builder().id(r.getId()).studentId(r.getStudentId())
            .studentName(r.getStudentName()).examId(r.getExam().getId()).examName(r.getExam().getName())
            .subjectName(r.getExam().getSubjectName()).totalMarks(r.getExam().getTotalMarks())
            .marksObtained(r.getMarksObtained()).grade(r.getGrade())
            .status(r.getStatus() != null ? r.getStatus().name() : null)
            .examCleared(r.getExamCleared()).remarks(r.getRemarks()).build();
    }
}
