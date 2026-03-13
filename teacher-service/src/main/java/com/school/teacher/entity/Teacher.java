package com.school.teacher.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "teachers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;           // links to auth-service User

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    private String email;
    private String phone;
    private String designation;    // e.g. "Class Teacher", "Subject Teacher"
    private String qualification;  // e.g. "M.Sc Mathematics"
    private String subjectsTaught; // comma-separated e.g. "Math,Science"
    private String profilePhotoUrl;

    private LocalDate joiningDate;
    private Boolean isActive = true;
    private Boolean showInDirectory = true; // public teacher directory

    @Column(columnDefinition = "TEXT")
    private String bio;
}
