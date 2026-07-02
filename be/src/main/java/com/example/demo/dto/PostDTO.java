package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostDTO {
    private UUID id;

    @NotNull(message = "classId is required")
    private UUID classId;
    private List<UUID> targetClassIds;

    @NotNull(message = "authorId is required")
    private UUID authorId;
    private String authorName;
    private String authorAvatar;

    @NotBlank(message = "type is required")
    @Pattern(regexp = "announcement|material|assignment", message = "type must be announcement, material, or assignment")
    private String type; // 'announcement' | 'material' | 'assignment'

    @NotBlank(message = "title is required")
    private String title;

    @NotBlank(message = "content is required")
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime dueAt;

    @Valid
    private List<AttachmentDTO> attachments;

    @Valid
    private List<CommentDTO> comments;
    private Long commentCount;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AttachmentDTO {
        private UUID id;

        @NotBlank(message = "fileUrl is required")
        private String fileUrl;

        @NotBlank(message = "fileName is required")
        private String fileName;
        private String fileType;
        private Integer fileSize;
    }
}
