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
    private final com.elearning.platform.repository.ClassRepository classRepository;
    private final com.elearning.platform.repository.ClassMemberRepository classMemberRepository;

    public List<Post> getAllPosts() {
        return postRepository.findAllActive();
    }

    public List<Post> getPostsByType(String postType) {
        return postRepository.findAllActiveByType(postType.toUpperCase());
    }

    public List<Post> getPostsByAuthor(UUID authorId) {
        return postRepository.findAllActiveByAuthor(authorId);
    }

    public List<Post> getPostsByClass(UUID classId) {
        return postRepository.findAllActiveByClass(classId);
    }

    /**
     * Lấy tất cả bài đăng từ các lớp mà người dùng tham gia
     */
    public List<Post> getPostsForUser(UUID userId) {
        // Lấy danh sách classId mà user tham gia
        List<UUID> classIds = classMemberRepository.findAllByStudentId(userId)
                .stream()
                .map(cm -> cm.getClassEntity().getId())
                .collect(java.util.stream.Collectors.toList());
        
        // Nếu là giáo viên, lấy thêm các lớp họ dạy
        classRepository.findByTeacherId(userId).forEach(c -> {
            if (!classIds.contains(c.getId())) classIds.add(c.getId());
        });

        if (classIds.isEmpty()) {
            // Có thể trả về bài đăng chung không có class_id
            return postRepository.findAllActiveWithoutClass();
        }

        return postRepository.findAllActiveByClasses(classIds);
    }

    @Transactional
    public Post createPost(PostRequestDTO dto) {
        Profile author = profileRepository.findById(dto.getAuthorId())
                .orElseThrow(() -> new RuntimeException("Author not found: " + dto.getAuthorId()));

        com.elearning.platform.entity.ClassEntity classEntity = null;
        if (dto.getClassId() != null) {
            classEntity = classRepository.findById(dto.getClassId())
                    .orElseThrow(() -> new RuntimeException("Class not found: " + dto.getClassId()));
        }

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
                .classEntity(classEntity)
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
