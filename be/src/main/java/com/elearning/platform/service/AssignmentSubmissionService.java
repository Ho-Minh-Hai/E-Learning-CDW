package com.elearning.platform.service;

import com.elearning.platform.dto.AssignmentSubmissionRequestDTO;
import com.elearning.platform.dto.AssignmentSubmissionResponseDTO;
import com.elearning.platform.entity.AssignmentSubmission;
import com.elearning.platform.entity.Post;
import com.elearning.platform.entity.Profile;
import com.elearning.platform.repository.AssignmentSubmissionRepository;
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
public class AssignmentSubmissionService {

    private final AssignmentSubmissionRepository submissionRepository;
    private final PostRepository postRepository;
    private final ProfileRepository profileRepository;

    /**
     * Get all submissions for an assignment
     */
    public List<AssignmentSubmissionResponseDTO> getSubmissionsByPost(UUID postId) {
        List<AssignmentSubmission> submissions = submissionRepository.findByPostId(postId);
        return submissions.stream()
                .map(AssignmentSubmissionResponseDTO::from)
                .toList();
    }

    /**
     * Get all submissions by a student
     */
    public List<AssignmentSubmissionResponseDTO> getSubmissionsByStudent(UUID studentId) {
        List<AssignmentSubmission> submissions = submissionRepository.findByStudentId(studentId);
        return submissions.stream()
                .map(AssignmentSubmissionResponseDTO::from)
                .toList();
    }

    /**
     * Get submissions for a post by a specific student
     */
    public List<AssignmentSubmissionResponseDTO> getSubmissionsByPostAndStudent(UUID postId, UUID studentId) {
        List<AssignmentSubmission> submissions = submissionRepository.findByPostIdAndStudentIdOrderBySubmittedAtDesc(postId, studentId);
        return submissions.stream()
                .map(AssignmentSubmissionResponseDTO::from)
                .toList();
    }

    /**
     * Get the latest submission for a post by a specific student
     */
    public AssignmentSubmissionResponseDTO getLatestSubmission(UUID postId, UUID studentId) {
        AssignmentSubmission submission = submissionRepository.findByPostIdAndStudentId(postId, studentId)
                .orElseThrow(() -> new RuntimeException("No submission found for post: " + postId + " and student: " + studentId));
        return AssignmentSubmissionResponseDTO.from(submission);
    }

    /**
     * Submit an assignment
     */
    @Transactional
    public AssignmentSubmissionResponseDTO submitAssignment(AssignmentSubmissionRequestDTO dto) {
        Post post = postRepository.findById(dto.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found: " + dto.getPostId()));

        // Verify it's an assignment
        if (!"ASSIGNMENT".equals(post.getPostType())) {
            throw new IllegalArgumentException("Post is not an assignment");
        }

        Profile student = profileRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found: " + dto.getStudentId()));

        if (dto.getFileUrl() == null || dto.getFileUrl().trim().isEmpty()) {
            throw new IllegalArgumentException("File URL cannot be empty");
        }

        if (dto.getFileName() == null || dto.getFileName().trim().isEmpty()) {
            throw new IllegalArgumentException("File name cannot be empty");
        }

        AssignmentSubmission submission = AssignmentSubmission.builder()
                .post(post)
                .student(student)
                .fileUrl(dto.getFileUrl())
                .fileName(dto.getFileName())
                .fileSize(dto.getFileSize())
                .submittedAt(OffsetDateTime.now())
                .build();

        AssignmentSubmission saved = submissionRepository.save(submission);
        return AssignmentSubmissionResponseDTO.from(saved);
    }

    /**
     * Delete a submission
     */
    @Transactional
    public void deleteSubmission(UUID submissionId, UUID requesterId) {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found: " + submissionId));

        Profile requester = profileRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("Requester not found: " + requesterId));

        // Check authorization - only student who submitted or teacher/admin can delete
        boolean isSubmitter = submission.getStudent().getId().equals(requesterId);
        boolean isTeacher = "teacher".equalsIgnoreCase(requester.getRole());
        boolean isAdmin = "admin".equalsIgnoreCase(requester.getRole());

        if (!isSubmitter && !isTeacher && !isAdmin) {
            throw new SecurityException("Not authorized to delete this submission");
        }

        submissionRepository.delete(submission);
    }

    /**
     * Get submission count for an assignment
     */
    public long getSubmissionCountByPost(UUID postId) {
        return submissionRepository.countByPostId(postId);
    }
}
