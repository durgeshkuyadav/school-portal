package com.school.student.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UpdateStudentRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String address;
    private String photoUrl;
    private String guardianName;
    private String guardianPhone;
    private String gender;
    private String bloodGroup;
    private String dob;
}
