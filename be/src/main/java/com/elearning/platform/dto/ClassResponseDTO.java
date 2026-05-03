package com.elearning.platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassResponseDTO {
    private UUID id;
    private String name;
    private UUID teacherId;
    private String teacherName;
    private String joinCode;
    private OffsetDateTime createdAt;
    private int studentCount;
}
