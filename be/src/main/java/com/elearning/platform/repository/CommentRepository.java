package com.elearning.platform.repository;

import com.elearning.platform.entity.Comment;
import com.elearning.platform.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {

    /**
     * Get all comments for a post, ordered by creation date (newest first)
     */
    @Query("SELECT c FROM Comment c WHERE c.post.id = :postId ORDER BY c.createdAt DESC")
    List<Comment> findByPostIdOrderByCreatedAtDesc(@Param("postId") UUID postId);

    /**
     * Get all comments by a specific author
     */
    @Query("SELECT c FROM Comment c WHERE c.author.id = :authorId ORDER BY c.createdAt DESC")
    List<Comment> findByAuthorId(@Param("authorId") UUID authorId);

    /**
     * Count comments on a post
     */
    long countByPostId(UUID postId);
}
