package com.school.student.controller;

import com.school.student.entity.Task;
import com.school.student.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/students/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    /** ADMIN — create and assign task to teacher/principal */
    @PostMapping
    public ResponseEntity<Task> createTask(
            @RequestBody Map<String, Object> req,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader(value = "X-User-Name", defaultValue = "Admin") String userName,
            @RequestHeader("X-User-Role") String userRole) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(taskService.createTask(req, Long.parseLong(userId), userName, userRole));
    }

    /** ADMIN — get all tasks they assigned */
    @GetMapping("/assigned-by-me")
    public ResponseEntity<List<Task>> getTasksIAssigned(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(taskService.getTasksAssignedByAdmin(Long.parseLong(userId)));
    }

    /** SUPER_ADMIN — get ALL tasks */
    @GetMapping("/all")
    public ResponseEntity<List<Task>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasksByPriority());
    }

    /** TEACHER/PRINCIPAL — get tasks assigned to me */
    @GetMapping("/my-tasks")
    public ResponseEntity<List<Task>> getMyTasks(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(taskService.getMyTasks(Long.parseLong(userId)));
    }

    /** TEACHER — update task status */
    @PutMapping("/{taskId}/status")
    public ResponseEntity<Task> updateStatus(
            @PathVariable Long taskId,
            @RequestBody Map<String, Object> req,
            @RequestHeader("X-User-Id") String userId) {
        String status = (String) req.get("status");
        String note = (String) req.get("note");
        return ResponseEntity.ok(taskService.updateTaskStatus(taskId, Long.parseLong(userId), status, note));
    }

    /** ADMIN — add remark on a task */
    @PutMapping("/{taskId}/remark")
    public ResponseEntity<Task> addRemark(
            @PathVariable Long taskId,
            @RequestBody Map<String, Object> req,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(taskService.addAdminRemark(taskId, Long.parseLong(userId),
            (String) req.get("remark")));
    }

    /** ADMIN — update/reassign task */
    @PutMapping("/{taskId}")
    public ResponseEntity<Task> updateTask(
            @PathVariable Long taskId,
            @RequestBody Map<String, Object> req) {
        return ResponseEntity.ok(taskService.updateTask(taskId, req));
    }

    /** ADMIN — delete task */
    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long taskId) {
        taskService.deleteTask(taskId);
        return ResponseEntity.noContent().build();
    }

    /** Dashboard stats */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String userRole) {
        boolean isAdmin = userRole.contains("ADMIN");
        return ResponseEntity.ok(taskService.getTaskStats(Long.parseLong(userId), isAdmin));
    }
}
