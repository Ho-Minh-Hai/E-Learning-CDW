package com.elearning.platform.repository;

import com.elearning.platform.entity.AssignmentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, UUID> {

    /**
     * Get all submissions for an assignment (post)
     */
    @Query("SELECT s FROM AssignmentSubmission s WHERE s.post.id = :postId ORDER BY s.submittedAt DESC")
    List<AssignmentSubmission> findByPostId(@Param("postId") UUID postId);

    /**
     * Get all submissions by a student
     */
    @Query("SELECT s FROM AssignmentSubmission s WHERE s.student.id = :studentId ORDER BY s.submittedAt DESC")
    List<AssignmentSubmission> findByStudentId(@Param("studentId") UUID studentId);

    /**
     * Get submission by both post and student (one submission per student per assignment)
     */
    Optional<AssignmentSubmission> findByPostIdAndStudentId(UUID postId, UUID studentId);

    /**
     * Get all submissions for a post by a specific student
     */
    @Query("SELECT s FROM AssignmentSubmission s WHERE s.post.id = :postId AND s.student.id = :studentId ORDER BY s.submittedAt DESC")
    List<AssignmentSubmission> findByPostIdAndStudentIdOrderBySubmittedAtDesc(@Param("postId") UUID postId, @Param("studentId") UUID studentId);

    /**
     * Count submissions for an assignment
     */
    long countByPostId(UUID postId);
}
