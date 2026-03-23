package com.school.attendance.repository;

import com.school.attendance.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    // Ek din ki puri class attendance
    List<Attendance> findByClassIdAndAttendanceDate(Long classId, LocalDate date);

    // Student ki ek din attendance
    Optional<Attendance> findByStudentIdAndClassIdAndAttendanceDate(
        Long studentId, Long classId, LocalDate date);

    // Student ki date range attendance
    List<Attendance> findByStudentIdAndAttendanceDateBetweenOrderByAttendanceDateDesc(
        Long studentId, LocalDate from, LocalDate to);

    // Class ki month-wise attendance
    @Query("SELECT a FROM Attendance a WHERE a.classId = :classId " +
           "AND MONTH(a.attendanceDate) = :month AND YEAR(a.attendanceDate) = :year " +
           "ORDER BY a.attendanceDate, a.studentId")
    List<Attendance> findByClassAndMonth(
        @Param("classId") Long classId,
        @Param("month") int month,
        @Param("year") int year);

    // Student ka total attendance count by status
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.studentId = :studentId " +
           "AND a.status = :status AND a.attendanceDate BETWEEN :from AND :to")
    long countByStudentAndStatus(
        @Param("studentId") Long studentId,
        @Param("status") Attendance.AttendanceStatus status,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to);

    // Class ka ek din attendance check - already marked?
    boolean existsByClassIdAndAttendanceDate(Long classId, LocalDate date);

    // Class ki date range
    List<Attendance> findByClassIdAndAttendanceDateBetweenOrderByAttendanceDateDesc(
        Long classId, LocalDate from, LocalDate to);

    // All students absent on a date
    List<Attendance> findByClassIdAndAttendanceDateAndStatus(
        Long classId, LocalDate date, Attendance.AttendanceStatus status);
}
