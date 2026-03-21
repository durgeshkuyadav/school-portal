package com.school.teacher.service;

import com.school.teacher.entity.Teacher;
import com.school.teacher.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeacherService {

    private final TeacherRepository teacherRepository;

    public List<Teacher> getAllTeachers() {
        return teacherRepository.findByIsActiveTrue();
    }

    public List<Teacher> getPublicTeacherProfiles() {
        return teacherRepository.findByIsActiveTrueAndShowInDirectoryTrue();
    }

    public Teacher getTeacherById(Long id) {
        return teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found: " + id));
    }

    public Teacher getTeacherByUserId(Long userId) {
        return teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Teacher not found for userId: " + userId));
    }

    public Teacher createTeacher(Map<String, Object> req) {
        Teacher teacher = Teacher.builder()
                // ✅ FIX: safely parse userId — empty string "" → null (no crash)
                .userId(parseLongSafe(req.get("userId")))
                .firstName(strOrNull(req, "firstName"))
                .lastName(strOrNull(req, "lastName"))
                .email(strOrNull(req, "email"))
                .phone(strOrNull(req, "phone"))
                .designation(strOrNull(req, "designation"))
                .qualification(strOrNull(req, "qualification"))
                .subjectsTaught(strOrNull(req, "subjectsTaught"))
                .profilePhotoUrl(strOrNull(req, "profilePhotoUrl"))
                // ✅ FIX: safely parse joiningDate — empty string "" → LocalDate.now()
                .joiningDate(parseDateSafe(req.get("joiningDate")))
                .bio(strOrNull(req, "bio"))
                .isActive(true)
                .showInDirectory(true)
                .build();
        return teacherRepository.save(teacher);
    }

    public Teacher updateTeacher(Long id, Map<String, Object> req) {
        Teacher teacher = getTeacherById(id);
        if (req.get("firstName") != null)       teacher.setFirstName((String) req.get("firstName"));
        if (req.get("lastName") != null)        teacher.setLastName((String) req.get("lastName"));
        if (req.get("phone") != null)           teacher.setPhone((String) req.get("phone"));
        if (req.get("designation") != null)     teacher.setDesignation((String) req.get("designation"));
        if (req.get("qualification") != null)   teacher.setQualification((String) req.get("qualification"));
        if (req.get("subjectsTaught") != null)  teacher.setSubjectsTaught((String) req.get("subjectsTaught"));
        if (req.get("bio") != null)             teacher.setBio((String) req.get("bio"));
        if (req.get("profilePhotoUrl") != null) teacher.setProfilePhotoUrl((String) req.get("profilePhotoUrl"));
        if (req.get("email") != null)           teacher.setEmail((String) req.get("email"));
        // ✅ FIX: also update joiningDate on edit
        if (req.get("joiningDate") != null) {
            LocalDate d = parseDateSafe(req.get("joiningDate"));
            if (d != null) teacher.setJoiningDate(d);
        }
        return teacherRepository.save(teacher);
    }

    public void deactivateTeacher(Long id) {
        Teacher teacher = getTeacherById(id);
        teacher.setIsActive(false);
        teacherRepository.save(teacher);
    }

    // ── Helpers ───────────────────────────────────────────────────

    /** Safely parse Long — returns null for null, blank, or non-numeric values */
    private Long parseLongSafe(Object val) {
        if (val == null) return null;
        String s = val.toString().trim();
        if (s.isBlank()) return null;
        try { return Long.parseLong(s); }
        catch (NumberFormatException e) { return null; }
    }

    /** Safely parse LocalDate — returns LocalDate.now() for null/blank */
    private LocalDate parseDateSafe(Object val) {
        if (val == null) return LocalDate.now();
        String s = val.toString().trim();
        if (s.isBlank()) return LocalDate.now();
        try { return LocalDate.parse(s); }
        catch (Exception e) { return LocalDate.now(); }
    }

    /** Return string value or null if key missing/blank */
    private String strOrNull(Map<String, Object> req, String key) {
        Object v = req.get(key);
        if (v == null) return null;
        String s = v.toString().trim();
        return s.isBlank() ? null : s;
    }
}