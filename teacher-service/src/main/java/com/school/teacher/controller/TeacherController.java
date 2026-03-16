package com.school.teacher.controller;

import com.school.teacher.entity.Teacher;
import com.school.teacher.service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/teachers")
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;

    /** PUBLIC — School website teacher directory */
    @GetMapping("/public")
    public ResponseEntity<List<Teacher>> getPublicProfiles() {
        return ResponseEntity.ok(teacherService.getPublicTeacherProfiles());
    }

    /** ADMIN — all active teachers */
    @GetMapping
    public ResponseEntity<List<Teacher>> getAll() {
        return ResponseEntity.ok(teacherService.getAllTeachers());
    }

    /** ADMIN — get by ID */
    @GetMapping("/{id}")
    public ResponseEntity<Teacher> getById(@PathVariable Long id) {
        return ResponseEntity.ok(teacherService.getTeacherById(id));
    }

    /** ADMIN — create teacher profile */
    @PostMapping
    public ResponseEntity<Teacher> create(@RequestBody Map<String, Object> req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(teacherService.createTeacher(req));
    }

    /** TEACHER/ADMIN — update profile */
    @PutMapping("/{id}")
    public ResponseEntity<Teacher> update(@PathVariable Long id,
                                           @RequestBody Map<String, Object> req) {
        return ResponseEntity.ok(teacherService.updateTeacher(id, req));
    }

    /** ADMIN — deactivate teacher */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        teacherService.deactivateTeacher(id);
        return ResponseEntity.noContent().build();
    }
}
