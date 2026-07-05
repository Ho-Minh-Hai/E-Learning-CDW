package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminClassDTO {
    private UUID id;
    private String name;
    private String joinCode;
    private String teacherName;
    private String teacherEmail;
    private long studentCount;
    private LocalDateTime createdAt;
}
