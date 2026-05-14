package com.elearning.platform.controller;

import com.elearning.platform.dto.AssignmentSubmissionRequestDTO;
import com.elearning.platform.dto.AssignmentSubmissionResponseDTO;
import com.elearning.platform.service.AssignmentSubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AssignmentSubmissionController {

    private final AssignmentSubmissionService submissionService;

    /**
     * GET /api/submissions?postId={uuid} — lấy tất cả submissions của một assignment
     */
    @GetMapping
    public ResponseEntity<List<AssignmentSubmissionResponseDTO>> getSubmissionsByPost(
            @RequestParam(required = false) UUID postId,
            @RequestParam(required = false) UUID studentId) {
        
        if (postId != null && studentId != null) {
            // Get submissions for specific post by specific student
            List<AssignmentSubmissionResponseDTO> submissions = submissionService.getSubmissionsByPostAndStudent(postId, studentId);
            return ResponseEntity.ok(submissions);
        } else if (postId != null) {
            // Get all submissions for a post
            List<AssignmentSubmissionResponseDTO> submissions = submissionService.getSubmissionsByPost(postId);
            return ResponseEntity.ok(submissions);
        } else if (studentId != null) {
            // Get all submissions by a student
            List<AssignmentSubmissionResponseDTO> submissions = submissionService.getSubmissionsByStudent(studentId);
            return ResponseEntity.ok(submissions);
        }
        
        return ResponseEntity.badRequest().build();
    }

    /**
     * GET /api/submissions/latest?postId={uuid}&studentId={uuid} — lấy submission mới nhất
     */
    @GetMapping("/latest")
    public ResponseEntity<AssignmentSubmissionResponseDTO> getLatestSubmission(
            @RequestParam UUID postId,
            @RequestParam UUID studentId) {
        AssignmentSubmissionResponseDTO submission = submissionService.getLatestSubmission(postId, studentId);
        return ResponseEntity.ok(submission);
    }

    /**
     * POST /api/submissions — nộp bài assignment
     */
    @PostMapping
    public ResponseEntity<AssignmentSubmissionResponseDTO> submitAssignment(
            @RequestBody AssignmentSubmissionRequestDTO dto) {
        AssignmentSubmissionResponseDTO created = submissionService.submitAssignment(dto);
        return ResponseEntity.ok(created);
    }

    /**
     * DELETE /api/submissions/{submissionId}?requesterId={uuid} — xoá submission
     */
    @DeleteMapping("/{submissionId}")
    public ResponseEntity<Void> deleteSubmission(
            @PathVariable UUID submissionId,
            @RequestParam UUID requesterId) {
        submissionService.deleteSubmission(submissionId, requesterId);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/submissions/count?postId={uuid} — đếm submissions của assignment
     */
    @GetMapping("/count")
    public ResponseEntity<Long> getSubmissionCount(
            @RequestParam UUID postId) {
        long count = submissionService.getSubmissionCountByPost(postId);
        return ResponseEntity.ok(count);
    }
}
