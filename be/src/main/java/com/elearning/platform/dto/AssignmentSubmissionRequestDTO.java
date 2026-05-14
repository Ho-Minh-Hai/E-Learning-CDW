package com.elearning.platform.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class AssignmentSubmissionRequestDTO {
    private UUID postId;
    private UUID studentId;
    private String fileUrl;
    private String fileName;
    private Long fileSize; // in bytes
}
