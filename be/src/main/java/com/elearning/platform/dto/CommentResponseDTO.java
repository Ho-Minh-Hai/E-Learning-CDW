package com.elearning.platform.dto;

import com.elearning.platform.entity.Comment;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class CommentResponseDTO {

    private UUID id;
    private UUID postId;
    private AuthorDTO author;
    private String content;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    @Data
    public static class AuthorDTO {
        private UUID id;
        private String fullName;
        private String avatarUrl;
        private String role;
    }

    public static CommentResponseDTO from(Comment comment) {
        CommentResponseDTO dto = new CommentResponseDTO();
        dto.setId(comment.getId());
        dto.setPostId(comment.getPost().getId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());

        if (comment.getAuthor() != null) {
            AuthorDTO author = new AuthorDTO();
            author.setId(comment.getAuthor().getId());
            author.setFullName(comment.getAuthor().getFullName());
            author.setAvatarUrl(comment.getAuthor().getAvatarUrl());
            author.setRole(comment.getAuthor().getRole());
            dto.setAuthor(author);
        }

        return dto;
    }
}
