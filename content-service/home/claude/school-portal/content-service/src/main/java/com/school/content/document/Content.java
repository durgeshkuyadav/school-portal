package com.school.content.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;

@Document(collection = "contents")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Content {
    @Id private String id;
    private String title;
    private String description;
    private String contentType;  // PDF_NOTES, VIDEO_LINK, IMAGE, ASSIGNMENT, WORKSHEET, ARTICLE, GALLERY_PHOTO

    private String fileUrl;
    private String fileName;
    private Long fileSizeBytes;
    private String mimeType;
    private String videoLink;
    private String imageUrl;     // ← NEW: for image/gallery display

    @Indexed private Long classId;
    private Long subjectId;
    @Indexed private String scope; // CLASS_WIDE, SUBJECT_SPECIFIC, PUBLIC

    private Long uploadedByUserId;
    private String uploaderName;
    private String uploaderRole;

    private boolean published = true;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
}
