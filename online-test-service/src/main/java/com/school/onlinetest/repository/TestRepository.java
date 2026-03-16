package com.school.onlinetest.repository;

import com.school.onlinetest.entity.Test;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TestRepository extends JpaRepository<Test, Long> {
    List<Test> findByClassIdAndIsActiveTrue(Long classId);
    List<Test> findByCreatedByUserId(Long userId);
}
