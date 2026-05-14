package com.elearning.platform.controller;

import com.elearning.platform.dto.CommentRequestDTO;
import com.elearning.platform.dto.CommentResponseDTO;
import com.elearning.platform.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CommentController {

    private final CommentService commentService;

    /**
     * GET /api/comments?postId={uuid} — lấy tất cả comments của một bài đăng
     */
    @GetMapping
    public ResponseEntity<List<CommentResponseDTO>> getCommentsByPost(
            @RequestParam UUID postId) {
        List<CommentResponseDTO> comments = commentService.getCommentsByPost(postId);
        return ResponseEntity.ok(comments);
    }

    /**
     * POST /api/comments — tạo comment mới
     */
    @PostMapping
    public ResponseEntity<CommentResponseDTO> createComment(@RequestBody CommentRequestDTO dto) {
        CommentResponseDTO created = commentService.createComment(dto);
        return ResponseEntity.ok(created);
    }

    /**
     * PUT /api/comments/{commentId}?requesterId={uuid} — cập nhật comment
     */
    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponseDTO> updateComment(
            @PathVariable UUID commentId,
            @RequestParam UUID requesterId,
            @RequestBody CommentRequestDTO dto) {
        CommentResponseDTO updated = commentService.updateComment(commentId, dto.getContent(), requesterId);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/comments/{commentId}?requesterId={uuid} — xoá comment
     */
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID commentId,
            @RequestParam UUID requesterId) {
        commentService.deleteComment(commentId, requesterId);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/comments/count?postId={uuid} — đếm comment của bài đăng
     */
    @GetMapping("/count")
    public ResponseEntity<Long> getCommentCount(
            @RequestParam UUID postId) {
        long count = commentService.getCommentCountByPost(postId);
        return ResponseEntity.ok(count);
    }
}
