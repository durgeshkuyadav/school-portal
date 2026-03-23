package com.school.content.service;

import com.school.content.document.Content;
import com.school.content.dto.*;
import com.school.content.repository.ContentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContentService {

    private final ContentRepository contentRepository;
    private static final String CLASS_WIDE = "CLASS_WIDE";
    private static final String SUBJECT_SPECIFIC = "SUBJECT_SPECIFIC";

    // ── PUBLIC: Gallery photos + Teacher articles (no auth needed) ──
    public List<ContentResponse> getPublicContent(String type) {
        List<Content> all = contentRepository.findByPublishedTrue();
        return all.stream()
            .filter(c -> {
                if (type == null) return true;
                return type.equalsIgnoreCase(c.getContentType());
            })
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    public List<ContentResponse> getVisibleContentForStudent(Long classId, String subjectIdsStr) {
        List<Long> enrolled = parseSubjectIds(subjectIdsStr);
        List<Content> classWide = contentRepository
            .findByClassIdAndScopeAndPublishedTrue(classId, CLASS_WIDE);
        List<Content> subjectSpec = enrolled.isEmpty() ? List.of()
            : contentRepository.findByClassIdAndScopeAndSubjectIdInAndPublishedTrue(
                classId, SUBJECT_SPECIFIC, enrolled);
        return Stream.concat(classWide.stream(), subjectSpec.stream())
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<ContentResponse> getContentByUploader(Long userId) {
        return contentRepository.findByUploadedByUserId(userId)
            .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<ContentResponse> getContentByClass(Long classId) {
        return contentRepository.findByClassIdAndPublishedTrue(classId)
            .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public ContentResponse uploadContent(UploadContentRequest req, Long userId,
            String uploaderName, String uploaderRole) {
        String scope = "CLASS_TEACHER".equalsIgnoreCase(uploaderRole)
            ? CLASS_WIDE : SUBJECT_SPECIFIC;
        Content c = Content.builder()
            .title(req.getTitle()).description(req.getDescription())
            .contentType(req.getContentType())
            .fileUrl(req.getFileUrl()).fileName(req.getFileName())
            .videoLink(req.getVideoLink())
            .imageUrl(req.getImageUrl())
            .classId(req.getClassId()).subjectId(req.getSubjectId()).scope(scope)
            .uploadedByUserId(userId).uploaderName(uploaderName).uploaderRole(uploaderRole)
            .published(true).publishedAt(LocalDateTime.now()).createdAt(LocalDateTime.now())
            .build();
        return mapToResponse(contentRepository.save(c));
    }

    public void deleteContent(String contentId, Long userId) {
        Content c = contentRepository.findById(contentId)
            .orElseThrow(() -> new RuntimeException("Content not found"));
        if (!c.getUploadedByUserId().equals(userId))
            throw new SecurityException("Not authorized");
        contentRepository.deleteById(contentId);
    }

    private List<Long> parseSubjectIds(String str) {
        if (str == null || str.isBlank()) return List.of();
        return Arrays.stream(str.split(",")).map(String::trim)
            .filter(s -> !s.isEmpty()).map(Long::parseLong).collect(Collectors.toList());
    }

    private ContentResponse mapToResponse(Content c) {
        return ContentResponse.builder()
            .id(c.getId()).title(c.getTitle()).description(c.getDescription())
            .contentType(c.getContentType()).fileUrl(c.getFileUrl())
            .fileName(c.getFileName()).videoLink(c.getVideoLink())
            .imageUrl(c.getImageUrl())
            .classId(c.getClassId()).subjectId(c.getSubjectId())
            .scope(c.getScope()).uploaderName(c.getUploaderName())
            .uploaderRole(c.getUploaderRole()).createdAt(c.getCreatedAt()).build();
    }
}
