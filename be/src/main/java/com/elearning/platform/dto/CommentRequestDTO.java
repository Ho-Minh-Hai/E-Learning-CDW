package com.elearning.platform.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class CommentRequestDTO {
    private UUID postId;
    private UUID authorId;
    private String content;
}
