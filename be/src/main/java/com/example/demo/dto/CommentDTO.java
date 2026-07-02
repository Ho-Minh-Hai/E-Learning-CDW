package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentDTO {
    private UUID id;

    @NotNull(message = "postId is required")
    private UUID postId;

    @NotNull(message = "userId is required")
    private UUID userId;
    private String userName;
    private String userAvatar;

    @NotBlank(message = "content is required")
    private String content;
    private LocalDateTime createdAt;
}
