package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.model.*;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ClassRepository classRepository;
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final ClassMemberRepository classMemberRepository;
    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final SubmissionRepository submissionRepository;
    private final SubmissionFileRepository submissionFileRepository;
    private final UserStreakRepository userStreakRepository;
    private final MessageRepository messageRepository;
    private final MessageEditRepository messageEditRepository;
    private final ConversationRepository conversationRepository;
    private final PostAttachmentRepository attachmentRepository;
    private final AssignmentDeadlineRepository assignmentDeadlineRepository;
    private final BannedKeywordRepository bannedKeywordRepository;

    @Transactional(readOnly = true)
    public AdminDashboardStatsDTO getDashboardStats() {
        return AdminDashboardStatsDTO.builder()
                .totalUsers(userRepository.count())
                .totalClasses(classRepository.count())
                .totalPosts(postRepository.count())
                .totalComments(commentRepository.count())
                .build();
    }

    // --- Users ---
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        List<User> users = userRepository.findAll();
        users.sort((u1, u2) -> {
            if (u1.getCreatedAt() == null && u2.getCreatedAt() == null) return 0;
            if (u1.getCreatedAt() == null) return 1;
            if (u2.getCreatedAt() == null) return -1;
            return u2.getCreatedAt().compareTo(u1.getCreatedAt());
        });
        return users;
    }

    @Transactional
    public User updateUserRole(UUID id, String newRole) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với ID: " + id));
        if (newRole == null || (!newRole.equals("0") && !newRole.equals("1") && !newRole.equals("2"))) {
            throw new IllegalArgumentException("Vai trò không hợp lệ: " + newRole);
        }
        user.setRole(newRole);
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với ID: " + userId));

        // 1. Delete user streaks
        userStreakRepository.deleteByUserId(userId);

        // 2. Delete class memberships
        classMemberRepository.deleteByStudentId(userId);

        // 3. Delete comments
        commentRepository.deleteByUserId(userId);

        // 4. Delete quiz attempts (cascade deletes StudentAnswers)
        quizAttemptRepository.deleteByUserId(userId);

        // 5. Delete student submissions
        List<Submission> submissions = submissionRepository.findByStudentId(userId);
        for (Submission sub : submissions) {
            submissionFileRepository.deleteBySubmissionId(sub.getId());
            submissionRepository.delete(sub);
        }

        // 6. Delete conversations and messages
        List<Conversation> conversations = conversationRepository.findByUser1OrUser2OrderByCreatedAtDesc(user, user);
        for (Conversation conv : conversations) {
            List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conv.getId());
            for (Message msg : messages) {
                messageEditRepository.deleteByMessageId(msg.getId());
                messageRepository.delete(msg);
            }
            conversationRepository.delete(conv);
        }

        // 7. Delete posts authored by this user
        List<PostEntity> userPosts = postRepository.findAll().stream()
                .filter(p -> userId.equals(p.getAuthorId()))
                .toList();
        for (PostEntity post : userPosts) {
            deletePost(post.getId());
        }

        // 8. Delete classes taught by this user
        List<ClassEntity> teacherClasses = classRepository.findByTeacherId(userId);
        for (ClassEntity cls : teacherClasses) {
            deleteClass(cls.getId());
        }

        // 9. Delete user itself
        userRepository.delete(user);
    }

    // --- Classes ---
    @Transactional(readOnly = true)
    public List<AdminClassDTO> getAllClasses() {
        List<ClassEntity> classes = classRepository.findAll();
        classes.sort((c1, c2) -> {
            if (c1.getCreatedAt() == null && c2.getCreatedAt() == null) return 0;
            if (c1.getCreatedAt() == null) return 1;
            if (c2.getCreatedAt() == null) return -1;
            return c2.getCreatedAt().compareTo(c1.getCreatedAt());
        });

        return classes.stream().map(c -> {
            String teacherName = "";
            String teacherEmail = "";
            if (c.getTeacherId() != null) {
                User teacher = userRepository.findById(c.getTeacherId()).orElse(null);
                if (teacher != null) {
                    teacherName = teacher.getFullName();
                    teacherEmail = teacher.getEmail();
                }
            }

            long studentCount = classMemberRepository.countByClassId(c.getId());

            return AdminClassDTO.builder()
                    .id(c.getId())
                    .name(c.getName())
                    .joinCode(c.getJoinCode())
                    .teacherName(teacherName)
                    .teacherEmail(teacherEmail)
                    .studentCount(studentCount)
                    .createdAt(c.getCreatedAt())
                    .build();
        }).toList();
    }

    @Transactional
    public void deleteClass(UUID classId) {
        // 1. Delete class members
        classMemberRepository.deleteByClassId(classId);

        // 2. Delete quizzes associated with the class
        List<Quiz> quizzes = quizRepository.findByClassId(classId);
        for (Quiz quiz : quizzes) {
            quizAttemptRepository.deleteByQuizId(quiz.getId());
            quizRepository.delete(quiz);
        }

        // 3. Delete posts associated with the class
        List<PostEntity> posts = postRepository.findByClassIdOrderByCreatedAtDesc(classId);
        for (PostEntity post : posts) {
            deletePost(post.getId());
        }

        // 4. Delete the class itself
        classRepository.deleteById(classId);
    }

    // --- Comments ---
    @Transactional(readOnly = true)
    public List<AdminCommentDTO> getAllComments() {
        List<Comment> comments = commentRepository.findAll();
        comments.sort((c1, c2) -> {
            if (c1.getCreatedAt() == null && c2.getCreatedAt() == null) return 0;
            if (c1.getCreatedAt() == null) return 1;
            if (c2.getCreatedAt() == null) return -1;
            return c2.getCreatedAt().compareTo(c1.getCreatedAt());
        });

        return comments.stream().map(c -> {
            String postTitle = "";
            String className = "";
            UUID classId = null;
            UUID postId = null;

            if (c.getPost() != null) {
                postId = c.getPost().getId();
                postTitle = c.getPost().getTitle();
                if (postTitle == null || postTitle.isBlank()) {
                    postTitle = c.getPost().getContent();
                    if (postTitle != null && postTitle.length() > 55) {
                        postTitle = postTitle.substring(0, 55) + "...";
                    }
                }
                
                classId = c.getPost().getClassId();
                if (classId != null) {
                    className = classRepository.findById(classId)
                            .map(ClassEntity::getName)
                            .orElse("");
                }
            }

            return AdminCommentDTO.builder()
                    .id(c.getId())
                    .content(c.getContent())
                    .createdAt(c.getCreatedAt())
                    .userId(c.getUser() != null ? c.getUser().getId() : null)
                    .userName(c.getUser() != null ? c.getUser().getFullName() : "")
                    .userEmail(c.getUser() != null ? c.getUser().getEmail() : "")
                    .postId(postId)
                    .postTitle(postTitle)
                    .classId(classId)
                    .className(className)
                    .build();
        }).toList();
    }

    @Transactional
    public void deleteComment(UUID commentId) {
        commentRepository.deleteById(commentId);
    }

    // --- Posts ---
    @Transactional(readOnly = true)
    public List<AdminPostDTO> getAllPosts() {
        List<PostEntity> posts = postRepository.findAll();
        posts.sort((p1, p2) -> {
            if (p1.getCreatedAt() == null && p2.getCreatedAt() == null) return 0;
            if (p1.getCreatedAt() == null) return 1;
            if (p2.getCreatedAt() == null) return -1;
            return p2.getCreatedAt().compareTo(p1.getCreatedAt());
        });

        return posts.stream().map(p -> {
            String authorName = "";
            String authorEmail = "";
            if (p.getAuthorId() != null) {
                User author = userRepository.findById(p.getAuthorId()).orElse(null);
                if (author != null) {
                    authorName = author.getFullName();
                    authorEmail = author.getEmail();
                }
            }

            String className = "";
            if (p.getClassId() != null) {
                className = classRepository.findById(p.getClassId())
                        .map(ClassEntity::getName)
                        .orElse("");
            }

            return AdminPostDTO.builder()
                    .id(p.getId())
                    .title(p.getTitle())
                    .content(p.getContent())
                    .type(p.getType())
                    .createdAt(p.getCreatedAt())
                    .authorId(p.getAuthorId())
                    .authorName(authorName)
                    .authorEmail(authorEmail)
                    .classId(p.getClassId())
                    .className(className)
                    .build();
        }).toList();
    }

    @Transactional
    public void deletePost(UUID postId) {
        // 1. Delete comments associated with the post
        commentRepository.deleteByPostId(postId);

        // 2. Delete post attachments
        attachmentRepository.deleteByPostId(postId);

        // 3. Delete assignment deadlines
        assignmentDeadlineRepository.deleteByPostId(postId);

        // 4. Delete submissions associated with the post
        List<Submission> submissions = submissionRepository.findByPostId(postId);
        for (Submission sub : submissions) {
            submissionFileRepository.deleteBySubmissionId(sub.getId());
            submissionRepository.delete(sub);
        }

        // 5. Delete post itself
        postRepository.deleteById(postId);
    }

    // --- Banned Keywords ---
    @Transactional(readOnly = true)
    public List<BannedKeyword> getAllBannedKeywords() {
        return bannedKeywordRepository.findAll();
    }

    @Transactional
    public BannedKeyword addBannedKeyword(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            throw new IllegalArgumentException("Từ khóa không được để trống.");
        }
        String cleanKeyword = keyword.trim().toLowerCase();
        if (bannedKeywordRepository.existsByKeyword(cleanKeyword)) {
            throw new IllegalArgumentException("Từ khóa này đã tồn tại trong danh sách cấm.");
        }
        BannedKeyword bannedKeyword = BannedKeyword.builder()
                .keyword(cleanKeyword)
                .createdAt(java.time.LocalDateTime.now())
                .build();
        return bannedKeywordRepository.save(bannedKeyword);
    }

    @Transactional
    public void deleteBannedKeyword(UUID id) {
        if (!bannedKeywordRepository.existsById(id)) {
            throw new IllegalArgumentException("Không tìm thấy từ khóa cấm với ID: " + id);
        }
        bannedKeywordRepository.deleteById(id);
    }
}
