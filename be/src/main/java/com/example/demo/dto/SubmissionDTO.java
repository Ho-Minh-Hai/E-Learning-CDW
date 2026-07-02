package com.example.demo.dto;

import lombok.Data;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class SubmissionDTO {
    private UUID id;

    @NotNull(message = "postId is required")
    private UUID postId;

    @NotNull(message = "studentId is required")
    private UUID studentId;
    private String studentName;
    private String studentAvatar;
    private String status;
    private BigDecimal score;
    private String gradeComment;
    private LocalDateTime submittedAt;

    @Valid
    private List<SubmissionFileDTO> files;

    @Data
    public static class SubmissionFileDTO {
        private UUID id;
        private String fileUrl;
        private String fileName;
        private LocalDateTime uploadedAt;
    }
}
