package com.elearning.platform.controller;

import com.elearning.platform.dto.PostRequestDTO;
import com.elearning.platform.dto.PostResponseDTO;
import com.elearning.platform.entity.Post;
import com.elearning.platform.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PostController {

    private final PostService postService;

    /**
     * GET /api/posts — lấy tất cả bài đăng (có thể lọc theo type)
     * Query param: type=ANNOUNCEMENT|DOCUMENT|ASSIGNMENT (tuỳ chọn)
     */
    @GetMapping
    public ResponseEntity<List<PostResponseDTO>> getPosts(
            @RequestParam(required = false) String type) {
        List<Post> posts = (type != null && !type.isBlank())
                ? postService.getPostsByType(type)
                : postService.getAllPosts();

        List<PostResponseDTO> dtos = posts.stream()
                .map(PostResponseDTO::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * GET /api/posts/author/{authorId} — lấy bài đăng theo tác giả
     */
    @GetMapping("/author/{authorId}")
    public ResponseEntity<List<PostResponseDTO>> getPostsByAuthor(@PathVariable UUID authorId) {
        List<PostResponseDTO> dtos = postService.getPostsByAuthor(authorId)
                .stream()
                .map(PostResponseDTO::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * POST /api/posts — tạo bài đăng mới
     */
    @PostMapping
    public ResponseEntity<PostResponseDTO> createPost(@RequestBody PostRequestDTO dto) {
        Post saved = postService.createPost(dto);
        return ResponseEntity.ok(PostResponseDTO.from(saved));
    }

    /**
     * DELETE /api/posts/{postId}?requesterId={uuid} — xoá mềm bài đăng
     */
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(
            @PathVariable UUID postId,
            @RequestParam UUID requesterId) {
        postService.deletePost(postId, requesterId);
        return ResponseEntity.noContent().build();
    }
}
