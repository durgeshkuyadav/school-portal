package com.school.calendar.service;

import com.school.calendar.entity.CalendarEvent;
import com.school.calendar.repository.CalendarEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final CalendarEventRepository repo;

    public List<CalendarEvent> getEvents(int month, int year) {
        return repo.findByMonthAndYear(month, year);
    }

    public List<CalendarEvent> getPublicEvents(int month, int year) {
        return repo.findPublicByMonthAndYear(month, year);
    }

    public List<CalendarEvent> getHolidays() {
        return repo.findByIsHolidayTrue();
    }

    public CalendarEvent createEvent(Map<String, Object> req, Long userId) {
        CalendarEvent event = CalendarEvent.builder()
                .title((String) req.get("title"))
                .description((String) req.get("description"))
                .eventDate(java.time.LocalDate.parse(req.get("eventDate").toString()))
                .eventType(req.getOrDefault("eventType", "OTHER").toString())
                .isHoliday(Boolean.parseBoolean(req.getOrDefault("isHoliday", "false").toString()))
                .isPublic(Boolean.parseBoolean(req.getOrDefault("isPublic", "true").toString()))
                .createdByUserId(userId)
                .build();
        return repo.save(event);
    }

    public CalendarEvent updateEvent(Long id, Map<String, Object> req) {
        CalendarEvent event = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found: " + id));
        if (req.get("title") != null) event.setTitle((String) req.get("title"));
        if (req.get("description") != null) event.setDescription((String) req.get("description"));
        if (req.get("eventDate") != null) event.setEventDate(java.time.LocalDate.parse(req.get("eventDate").toString()));
        if (req.get("eventType") != null) event.setEventType((String) req.get("eventType"));
        if (req.get("isHoliday") != null) event.setIsHoliday(Boolean.parseBoolean(req.get("isHoliday").toString()));
        return repo.save(event);
    }

    public void deleteEvent(Long id) {
        repo.deleteById(id);
    }
}
