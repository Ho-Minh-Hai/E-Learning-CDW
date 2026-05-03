package com.elearning.platform.dto;

import com.elearning.platform.entity.Post;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class PostResponseDTO {

    private UUID id;
    private String postType;
    private String title;
    private String content;
    private String fileUrl;
    private String fileName;
    private OffsetDateTime deadline;
    private AuthorDTO author;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    @Data
    public static class AuthorDTO {
        private UUID id;
        private String fullName;
        private String avatarUrl;
        private String role;
    }

    public static PostResponseDTO from(Post post) {
        PostResponseDTO dto = new PostResponseDTO();
        dto.setId(post.getId());
        dto.setPostType(post.getPostType());
        dto.setTitle(post.getTitle());
        dto.setContent(post.getContent());
        dto.setFileUrl(post.getFileUrl());
        dto.setFileName(post.getFileName());
        dto.setDeadline(post.getDeadline());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getUpdatedAt());

        if (post.getAuthor() != null) {
            AuthorDTO author = new AuthorDTO();
            author.setId(post.getAuthor().getId());
            author.setFullName(post.getAuthor().getFullName());
            author.setAvatarUrl(post.getAuthor().getAvatarUrl());
            author.setRole(post.getAuthor().getRole());
            dto.setAuthor(author);
        }

        return dto;
    }
}
