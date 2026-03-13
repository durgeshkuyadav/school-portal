package com.school.calendar.repository;

import com.school.calendar.entity.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {

    @Query("SELECT e FROM CalendarEvent e WHERE MONTH(e.eventDate) = :month AND YEAR(e.eventDate) = :year ORDER BY e.eventDate")
    List<CalendarEvent> findByMonthAndYear(@Param("month") int month, @Param("year") int year);

    @Query("SELECT e FROM CalendarEvent e WHERE MONTH(e.eventDate) = :month AND YEAR(e.eventDate) = :year AND e.isPublic = true ORDER BY e.eventDate")
    List<CalendarEvent> findPublicByMonthAndYear(@Param("month") int month, @Param("year") int year);

    List<CalendarEvent> findByIsHolidayTrue();
}
