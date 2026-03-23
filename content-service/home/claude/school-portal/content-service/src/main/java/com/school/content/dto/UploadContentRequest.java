package com.school.content.dto;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UploadContentRequest {
    private String title;
    private String description;
    private String contentType;
    private String fileUrl;
    private String fileName;
    private String videoLink;
    private String imageUrl;   // ← NEW
    private Long classId;
    private Long subjectId;
}
