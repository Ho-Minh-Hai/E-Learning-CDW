package com.elearning.platform.dto;

import com.elearning.platform.entity.AssignmentSubmission;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class AssignmentSubmissionResponseDTO {

    private UUID id;
    private UUID postId;
    private StudentDTO student;
    private String fileUrl;
    private String fileName;
    private Long fileSize; // in bytes
    private OffsetDateTime submittedAt;
    private OffsetDateTime createdAt;

    @Data
    public static class StudentDTO {
        private UUID id;
        private String fullName;
        private String avatarUrl;
        private String role;
    }

    public static AssignmentSubmissionResponseDTO from(AssignmentSubmission submission) {
        AssignmentSubmissionResponseDTO dto = new AssignmentSubmissionResponseDTO();
        dto.setId(submission.getId());
        dto.setPostId(submission.getPost().getId());
        dto.setFileUrl(submission.getFileUrl());
        dto.setFileName(submission.getFileName());
        dto.setFileSize(submission.getFileSize());
        dto.setSubmittedAt(submission.getSubmittedAt());
        dto.setCreatedAt(submission.getCreatedAt());

        if (submission.getStudent() != null) {
            StudentDTO student = new StudentDTO();
            student.setId(submission.getStudent().getId());
            student.setFullName(submission.getStudent().getFullName());
            student.setAvatarUrl(submission.getStudent().getAvatarUrl());
            student.setRole(submission.getStudent().getRole());
            dto.setStudent(student);
        }

        return dto;
    }
}
