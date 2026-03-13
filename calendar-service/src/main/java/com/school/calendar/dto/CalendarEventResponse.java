package com.school.calendar.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CalendarEventResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDate eventDate;
    private String eventType;
    private Boolean isHoliday;
    private Boolean isPublic;
    private Long createdByUserId;
    private LocalDateTime createdAt;
}
