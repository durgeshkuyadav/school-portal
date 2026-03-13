package com.school.teacher.dto;

import lombok.*;
import java.time.LocalDate;

public class TeacherDtos {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateTeacherRequest {
        private Long userId;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private String designation;
        private String qualification;
        private String subjectsTaught;
        private String profilePhotoUrl;
        private LocalDate joiningDate;
        private String bio;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UpdateTeacherRequest {
        private String firstName;
        private String lastName;
        private String phone;
        private String designation;
        private String qualification;
        private String subjectsTaught;
        private String profilePhotoUrl;
        private String bio;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class TeacherResponse {
        private Long id;
        private Long userId;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private String designation;
        private String qualification;
        private String subjectsTaught;
        private String profilePhotoUrl;
        private LocalDate joiningDate;
        private Boolean isActive;
        private Boolean showInDirectory;
        private String bio;
    }
}
