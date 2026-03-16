package com.school.notification.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder @ToString
public class NotificationEvent {
    private String eventType;        // RESULT_PUBLISHED, EXAM_CREATED, CONTENT_UPLOADED
    private String title;            // Email subject base
    private String message;          // Email body content
    private String recipientEmail;   // Who to send to (can be null — then just log)
    private Long recipientUserId;
    private Long relatedEntityId;    // examId / contentId / resultId
    private String relatedEntityType;
}
