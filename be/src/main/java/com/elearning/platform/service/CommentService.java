package com.elearning.platform.service;

import com.elearning.platform.dto.CommentRequestDTO;
import com.elearning.platform.dto.CommentResponseDTO;
import com.elearning.platform.entity.Comment;
import com.elearning.platform.entity.Post;
import com.elearning.platform.entity.Profile;
import com.elearning.platform.repository.CommentRepository;
import com.elearning.platform.repository.PostRepository;
import com.elearning.platform.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final ProfileRepository profileRepository;

    /**
     * Get all comments for a post
     */
    public List<CommentResponseDTO> getCommentsByPost(UUID postId) {
        List<Comment> comments = commentRepository.findByPostIdOrderByCreatedAtDesc(postId);
        return comments.stream()
                .map(CommentResponseDTO::from)
                .toList();
    }

    /**
     * Create a new comment
     */
    @Transactional
    public CommentResponseDTO createComment(CommentRequestDTO dto) {
        Post post = postRepository.findById(dto.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found: " + dto.getPostId()));

        Profile author = profileRepository.findById(dto.getAuthorId())
                .orElseThrow(() -> new RuntimeException("Author not found: " + dto.getAuthorId()));

        if (dto.getContent() == null || dto.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("Comment content cannot be empty");
        }

        Comment comment = Comment.builder()
                .post(post)
                .author(author)
                .content(dto.getContent())
                .build();

        Comment saved = commentRepository.save(comment);
        return CommentResponseDTO.from(saved);
    }

    /**
     * Update a comment
     */
    @Transactional
    public CommentResponseDTO updateComment(UUID commentId, String content, UUID requesterId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found: " + commentId));

        Profile requester = profileRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("Requester not found: " + requesterId));

        // Check authorization - only author or admin can edit
        boolean isAuthor = comment.getAuthor().getId().equals(requesterId);
        boolean isAdmin = "admin".equalsIgnoreCase(requester.getRole());

        if (!isAuthor && !isAdmin) {
            throw new SecurityException("Not authorized to edit this comment");
        }

        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Comment content cannot be empty");
        }

        comment.setContent(content);
        comment.setUpdatedAt(OffsetDateTime.now());

        Comment updated = commentRepository.save(comment);
        return CommentResponseDTO.from(updated);
    }

    /**
     * Delete a comment
     */
    @Transactional
    public void deleteComment(UUID commentId, UUID requesterId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found: " + commentId));

        Profile requester = profileRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("Requester not found: " + requesterId));

        // Check authorization - only author or admin can delete
        boolean isAuthor = comment.getAuthor().getId().equals(requesterId);
        boolean isAdmin = "admin".equalsIgnoreCase(requester.getRole());

        if (!isAuthor && !isAdmin) {
            throw new SecurityException("Not authorized to delete this comment");
        }

        commentRepository.delete(comment);
    }

    /**
     * Get comment count for a post
     */
    public long getCommentCountByPost(UUID postId) {
        return commentRepository.countByPostId(postId);
    }
}
