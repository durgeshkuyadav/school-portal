package com.school.student.controller;

import com.school.student.entity.SchoolClass;
import com.school.student.repository.SchoolClassRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/students/classes")
@RequiredArgsConstructor
@Tag(name = "Classes", description = "School class management APIs")
public class ClassController {

    private final SchoolClassRepository classRepository;

    @GetMapping
    @Operation(summary = "Get all classes")
    public ResponseEntity<List<SchoolClass>> getAllClasses() {
        return ResponseEntity.ok(classRepository.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get class by ID")
    public ResponseEntity<SchoolClass> getById(@PathVariable Long id) {
        return classRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create a new class — Admin only")
    public ResponseEntity<SchoolClass> create(@Valid @RequestBody CreateClassRequest req) {
        SchoolClass cls = SchoolClass.builder()
            .name(req.getName())
            .section(req.getSection())
            .academicYear(req.getAcademicYear())
            .capacity(req.getMaxStudents() != null ? req.getMaxStudents() : 40)
            .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(classRepository.save(cls));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a class — Admin only")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        classRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ── Inner DTO ─────────────────────────────────────────────────
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class CreateClassRequest {
        private String name;
        private String section;
        private String academicYear;
        private Integer maxStudents;
    }
}
