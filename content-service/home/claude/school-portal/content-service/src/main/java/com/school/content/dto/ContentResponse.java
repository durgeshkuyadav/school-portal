package com.school.content.dto;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContentResponse {
    private String id;
    private String title;
    private String description;
    private String contentType;
    private String fileUrl;
    private String fileName;
    private String videoLink;
    private String imageUrl;   // ← NEW
    private Long classId;
    private Long subjectId;
    private String scope;
    private String uploaderName;
    private String uploaderRole;
    private LocalDateTime createdAt;
}
