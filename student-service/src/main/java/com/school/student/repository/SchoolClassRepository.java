package com.school.student.repository;

import com.school.student.entity.SchoolClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SchoolClassRepository extends JpaRepository<SchoolClass, Long> {
    Optional<SchoolClass> findByNameAndSection(String name, String section);
    boolean existsByNameAndSection(String name, String section);
}
