package com.school.content.controller;

import com.school.content.dto.*;
import com.school.content.service.ContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/content")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;

    // ── PUBLIC — no JWT needed (gallery + articles for public site)
    @GetMapping("/public")
    public ResponseEntity<List<ContentResponse>> getPublicContent(
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(contentService.getPublicContent(type));
    }

    // ── STUDENT — class content
    @GetMapping("/student")
    public ResponseEntity<List<ContentResponse>> getStudentContent(
            @RequestHeader("X-Class-Id") String classId,
            @RequestHeader(value = "X-Subject-Ids", required = false) String subjectIds) {
        return ResponseEntity.ok(
            contentService.getVisibleContentForStudent(Long.parseLong(classId), subjectIds));
    }

    // ── TEACHER — own content
    @GetMapping("/my-content")
    public ResponseEntity<List<ContentResponse>> getMyContent(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(contentService.getContentByUploader(Long.parseLong(userId)));
    }

    // ── ADMIN — all content for a class
    @GetMapping("/class/{classId}")
    public ResponseEntity<List<ContentResponse>> getClassContent(@PathVariable Long classId) {
        return ResponseEntity.ok(contentService.getContentByClass(classId));
    }

    // ── TEACHER — upload
    @PostMapping("/upload")
    public ResponseEntity<ContentResponse> upload(
            @RequestBody UploadContentRequest req,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader(value = "X-User-Name", defaultValue = "Teacher") String uploaderName,
            @RequestHeader("X-User-Role") String userRole) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(contentService.uploadContent(req, Long.parseLong(userId), uploaderName, userRole));
    }

    // ── TEACHER/ADMIN — delete
    @DeleteMapping("/{contentId}")
    public ResponseEntity<Void> delete(
            @PathVariable String contentId,
            @RequestHeader("X-User-Id") String userId) {
        contentService.deleteContent(contentId, Long.parseLong(userId));
        return ResponseEntity.noContent().build();
    }
}
