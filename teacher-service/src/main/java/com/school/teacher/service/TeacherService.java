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
                .userId(req.get("userId") != null ? Long.parseLong(req.get("userId").toString()) : null)
                .firstName((String) req.get("firstName"))
                .lastName((String) req.get("lastName"))
                .email((String) req.get("email"))
                .phone((String) req.get("phone"))
                .designation((String) req.get("designation"))
                .qualification((String) req.get("qualification"))
                .subjectsTaught((String) req.get("subjectsTaught"))
                .profilePhotoUrl((String) req.get("profilePhotoUrl"))
                .joiningDate(req.get("joiningDate") != null
                        ? LocalDate.parse(req.get("joiningDate").toString()) : LocalDate.now())
                .bio((String) req.get("bio"))
                .isActive(true)
                .showInDirectory(true)
                .build();
        return teacherRepository.save(teacher);
    }

    public Teacher updateTeacher(Long id, Map<String, Object> req) {
        Teacher teacher = getTeacherById(id);
        if (req.get("firstName") != null) teacher.setFirstName((String) req.get("firstName"));
        if (req.get("lastName") != null) teacher.setLastName((String) req.get("lastName"));
        if (req.get("phone") != null) teacher.setPhone((String) req.get("phone"));
        if (req.get("designation") != null) teacher.setDesignation((String) req.get("designation"));
        if (req.get("qualification") != null) teacher.setQualification((String) req.get("qualification"));
        if (req.get("subjectsTaught") != null) teacher.setSubjectsTaught((String) req.get("subjectsTaught"));
        if (req.get("bio") != null) teacher.setBio((String) req.get("bio"));
        if (req.get("profilePhotoUrl") != null) teacher.setProfilePhotoUrl((String) req.get("profilePhotoUrl"));
        return teacherRepository.save(teacher);
    }

    public void deactivateTeacher(Long id) {
        Teacher teacher = getTeacherById(id);
        teacher.setIsActive(false);
        teacherRepository.save(teacher);
    }
}
