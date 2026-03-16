package com.school.onlinetest.repository;

import com.school.onlinetest.entity.TestAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TestAttemptRepository extends JpaRepository<TestAttempt, Long> {
    List<TestAttempt> findByStudentId(Long studentId);
    Optional<TestAttempt> findByTestIdAndStudentId(Long testId, Long studentId);
    List<TestAttempt> findByTestId(Long testId);
}
