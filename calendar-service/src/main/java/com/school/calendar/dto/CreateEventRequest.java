package com.school.calendar.dto;

import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateEventRequest {
    private String title;
    private String description;
    private String eventDate;       // ISO date string "2025-12-25"
    private String eventType;       // HOLIDAY, EXAM, SPORTS, CULTURAL, MEETING, OTHER
    private Boolean isHoliday;
    private Boolean isPublic;
}

