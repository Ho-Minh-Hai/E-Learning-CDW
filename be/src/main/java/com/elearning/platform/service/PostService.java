package com.elearning.platform.service;

import com.elearning.platform.dto.PostRequestDTO;
import com.elearning.platform.entity.Post;
import com.elearning.platform.entity.Profile;
import com.elearning.platform.repository.PostRepository;
import com.elearning.platform.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final ProfileRepository profileRepository;

    public List<Post> getAllPosts() {
        return postRepository.findAllActive();
    }

    public List<Post> getPostsByType(String postType) {
        return postRepository.findAllActiveByType(postType.toUpperCase());
    }

    public List<Post> getPostsByAuthor(UUID authorId) {
        return postRepository.findAllActiveByAuthor(authorId);
    }

    @Transactional
    public Post createPost(PostRequestDTO dto) {
        Profile author = profileRepository.findById(dto.getAuthorId())
                .orElseThrow(() -> new RuntimeException("Author not found: " + dto.getAuthorId()));

        String postType = dto.getPostType().toUpperCase();
        if (!postType.equals("ANNOUNCEMENT") && !postType.equals("DOCUMENT") && !postType.equals("ASSIGNMENT")) {
            throw new IllegalArgumentException("Invalid post type: " + dto.getPostType());
        }

        Post post = Post.builder()
                .postType(postType)
                .title(dto.getTitle())
                .content(dto.getContent())
                .fileUrl(dto.getFileUrl())
                .fileName(dto.getFileName())
                .deadline(dto.getDeadline())
                .author(author)
                .build();

        return postRepository.save(post);
    }

    @Transactional
    public void deletePost(UUID postId, UUID requesterId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found: " + postId));

        Profile requester = profileRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("Requester not found: " + requesterId));

        boolean isAuthor = post.getAuthor().getId().equals(requesterId);
        boolean isAdmin = "admin".equalsIgnoreCase(requester.getRole());

        if (!isAuthor && !isAdmin) {
            throw new SecurityException("Not authorized to delete this post");
        }

        post.setDeleted(true);
        postRepository.save(post);
    }
}
