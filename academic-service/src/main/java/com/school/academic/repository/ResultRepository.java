package com.school.academic.repository;

import com.school.academic.entity.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResultRepository extends JpaRepository<Result, Long> {
    Optional<Result> findByExamIdAndStudentId(Long examId, Long studentId);
    List<Result> findByExamId(Long examId);

    @Query("SELECT r FROM Result r WHERE r.studentId = :studentId AND r.exam.academicYear = :academicYear")
    List<Result> findByStudentIdAndAcademicYear(@Param("studentId") Long studentId,
                                                @Param("academicYear") String academicYear);
}
