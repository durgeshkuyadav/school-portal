package com.school.student.service;

import com.school.student.entity.Task;
import com.school.student.kafka.TaskEventProducer;
import com.school.student.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskEventProducer taskEventProducer;

    // ── Admin: Task banao aur assign karo ────────
    @Transactional
    public Task createTask(
            Map<String, Object> req,
            Long adminUserId,
            String adminName,
            String adminRole) {

        Task task = Task.builder()
            .title((String) req.get("title"))
            .description((String) req.get("description"))
            .assignedByUserId(adminUserId)
            .assignedByName(adminName)
            .assignedByRole(adminRole)
            .assignedToUserId(req.get("assignedToUserId") != null
                ? Long.parseLong(
                    req.get("assignedToUserId").toString())
                : null)
            .assignedToName((String) req.get("assignedToName"))
            .assignedToRole((String) req.get("assignedToRole"))
            .priority(req.getOrDefault(
                "priority", "MEDIUM").toString())
            .category(req.getOrDefault(
                "category", "ADMINISTRATIVE").toString())
            .dueDate(req.get("dueDate") != null
                ? LocalDate.parse(
                    req.get("dueDate").toString())
                : null)
            .build();

        Task saved = taskRepository.save(task);

        // ✅ Kafka event bhejo — notification jayegi
        try {
            taskEventProducer.publishTaskAssigned(
                saved.getId(),
                saved.getTitle(),
                adminName
            );
            log.info("✅ Task event sent: {}",
                saved.getTitle());
        } catch (Exception e) {
            log.warn("⚠️ Kafka event failed: {}",
                e.getMessage());
        }

        return saved;
    }

    // ── Admin: Apne assign kiye tasks dekho ──────
    public List<Task> getTasksAssignedByAdmin(
            Long adminUserId) {
        return taskRepository
            .findByAssignedByUserIdOrderByCreatedAtDesc(
                adminUserId);
    }

    // ── Super Admin: Sare tasks dekho ────────────
    public List<Task> getAllTasksByPriority() {
        return taskRepository.findAllByPriority();
    }

    // ── Teacher: Apne tasks dekho ────────────────
    public List<Task> getMyTasks(Long userId) {
        return taskRepository
            .findByAssignedToUserIdOrderByCreatedAtDesc(
                userId);
    }

    // ── Teacher: Task status update karo ─────────
    @Transactional
    public Task updateTaskStatus(
            Long taskId,
            Long userId,
            String status,
            String note) {

        Task task = taskRepository.findById(taskId)
            .orElseThrow(() ->
                new RuntimeException(
                    "Task not found: " + taskId));

        if (!task.getAssignedToUserId().equals(userId)
                && !task.getAssignedByUserId().equals(userId)) {
            throw new SecurityException(
                "Not authorized to update this task");
        }

        task.setStatus(status);
        if (note != null) task.setCompletionNote(note);
        if ("COMPLETED".equals(status))
            task.setCompletedAt(LocalDateTime.now());

        return taskRepository.save(task);
    }

    // ── Admin: Remark add karo ────────────────────
    @Transactional
    public Task addAdminRemark(
            Long taskId,
            Long adminUserId,
            String remark) {

        Task task = taskRepository.findById(taskId)
            .orElseThrow(() ->
                new RuntimeException(
                    "Task not found: " + taskId));
        task.setAdminRemark(remark);
        return taskRepository.save(task);
    }

    // ── Admin: Task update/reassign karo ─────────
    @Transactional
    public Task updateTask(
            Long taskId,
            Map<String, Object> req) {

        Task task = taskRepository.findById(taskId)
            .orElseThrow(() ->
                new RuntimeException(
                    "Task not found: " + taskId));

        if (req.get("title") != null)
            task.setTitle((String) req.get("title"));
        if (req.get("description") != null)
            task.setDescription(
                (String) req.get("description"));
        if (req.get("priority") != null)
            task.setPriority((String) req.get("priority"));
        if (req.get("status") != null)
            task.setStatus((String) req.get("status"));
        if (req.get("dueDate") != null)
            task.setDueDate(LocalDate.parse(
                req.get("dueDate").toString()));
        if (req.get("assignedToUserId") != null)
            task.setAssignedToUserId(Long.parseLong(
                req.get("assignedToUserId").toString()));
        if (req.get("assignedToName") != null)
            task.setAssignedToName(
                (String) req.get("assignedToName"));
        if (req.get("assignedToRole") != null)
            task.setAssignedToRole(
                (String) req.get("assignedToRole"));

        return taskRepository.save(task);
    }

    // ── Admin: Task delete karo ───────────────────
    public void deleteTask(Long taskId) {
        taskRepository.deleteById(taskId);
    }

    // ── Dashboard Stats ───────────────────────────
    public Map<String, Long> getTaskStats(
            Long userId, boolean isAdmin) {

        if (isAdmin) {
            return Map.of(
                "totalCreated",
                    taskRepository
                        .countByAssignedByUserIdAndStatus(
                            userId, "PENDING")
                    + taskRepository
                        .countByAssignedByUserIdAndStatus(
                            userId, "IN_PROGRESS")
                    + taskRepository
                        .countByAssignedByUserIdAndStatus(
                            userId, "COMPLETED"),
                "pending",
                    taskRepository
                        .countByAssignedByUserIdAndStatus(
                            userId, "PENDING"),
                "inProgress",
                    taskRepository
                        .countByAssignedByUserIdAndStatus(
                            userId, "IN_PROGRESS"),
                "completed",
                    taskRepository
                        .countByAssignedByUserIdAndStatus(
                            userId, "COMPLETED")
            );
        }

        return Map.of(
            "pending",
                taskRepository
                    .countByAssignedToUserIdAndStatus(
                        userId, "PENDING"),
            "inProgress",
                taskRepository
                    .countByAssignedToUserIdAndStatus(
                        userId, "IN_PROGRESS"),
            "completed",
                taskRepository
                    .countByAssignedToUserIdAndStatus(
                        userId, "COMPLETED")
        );
    }
}
