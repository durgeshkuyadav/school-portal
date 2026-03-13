package com.school.teacher.repository;

import com.school.teacher.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    List<Teacher> findByIsActiveTrue();
    List<Teacher> findByIsActiveTrueAndShowInDirectoryTrue();
    Optional<Teacher> findByUserId(Long userId);
    Optional<Teacher> findByEmail(String email);
}
