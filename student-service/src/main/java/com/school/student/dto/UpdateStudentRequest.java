package com.school.student.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UpdateStudentRequest {
    private String firstName;
    private String lastName;
    private String address;
    private String photoUrl;
    private String guardianPhone;
}
