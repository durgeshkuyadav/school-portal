package com.school.calendar.controller;

import com.school.calendar.entity.CalendarEvent;
import com.school.calendar.service.CalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    /** PUBLIC — visible on school website */
    @GetMapping("/public/events")
    public ResponseEntity<List<CalendarEvent>> getPublicEvents(
            @RequestParam int month, @RequestParam int year) {
        return ResponseEntity.ok(calendarService.getPublicEvents(month, year));
    }

    /** PUBLIC — all holidays */
    @GetMapping("/public/holidays")
    public ResponseEntity<List<CalendarEvent>> getHolidays() {
        return ResponseEntity.ok(calendarService.getHolidays());
    }

    /** PROTECTED — all events for a month (authenticated users) */
    @GetMapping("/events")
    public ResponseEntity<List<CalendarEvent>> getEvents(
            @RequestParam int month, @RequestParam int year) {
        return ResponseEntity.ok(calendarService.getEvents(month, year));
    }

    /** ADMIN — create event */
    @PostMapping("/events")
    public ResponseEntity<CalendarEvent> createEvent(
            @RequestBody Map<String, Object> req,
            @RequestHeader(value = "X-User-Id", defaultValue = "0") String userId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(calendarService.createEvent(req, Long.parseLong(userId)));
    }

    /** ADMIN — update event */
    @PutMapping("/events/{id}")
    public ResponseEntity<CalendarEvent> updateEvent(
            @PathVariable Long id, @RequestBody Map<String, Object> req) {
        return ResponseEntity.ok(calendarService.updateEvent(id, req));
    }

    /** ADMIN — delete event */
    @DeleteMapping("/events/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        calendarService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}
