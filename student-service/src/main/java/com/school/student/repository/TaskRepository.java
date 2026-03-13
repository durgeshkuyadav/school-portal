package com.school.student.repository;

import com.school.student.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // Tasks assigned BY an admin
    List<Task> findByAssignedByUserIdOrderByCreatedAtDesc(Long userId);

    // Tasks assigned TO a teacher/principal
    List<Task> findByAssignedToUserIdOrderByCreatedAtDesc(Long userId);

    // Tasks assigned TO someone filtered by status
    List<Task> findByAssignedToUserIdAndStatusOrderByDueDateAsc(Long userId, String status);

    // All tasks (admin view) sorted by priority then date
    @Query("SELECT t FROM Task t ORDER BY " +
           "CASE t.priority WHEN 'URGENT' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END, " +
           "t.createdAt DESC")
    List<Task> findAllByPriority();

    // Count by status for dashboard
    long countByAssignedToUserIdAndStatus(Long userId, String status);
    long countByAssignedByUserIdAndStatus(Long userId, String status);
}
