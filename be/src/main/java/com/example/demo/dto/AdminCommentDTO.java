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
public class AdminCommentDTO {
    private UUID id;
    private String content;
    private LocalDateTime createdAt;
    private UUID userId;
    private String userName;
    private String userEmail;
    private UUID postId;
    private String postTitle;
    private UUID classId;
    private String className;
}
