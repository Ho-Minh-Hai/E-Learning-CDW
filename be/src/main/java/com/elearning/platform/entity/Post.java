package com.elearning.platform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "posts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /**
     * Loại bài đăng: ANNOUNCEMENT | DOCUMENT | ASSIGNMENT
     */
    @Column(name = "post_type", nullable = false, length = 20)
    private String postType;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "text")
    private String content;

    /**
     * URL tài liệu đính kèm (dùng cho loại DOCUMENT)
     */
    @Column(name = "file_url")
    private String fileUrl;

    /**
     * Tên file gốc (dùng cho loại DOCUMENT)
     */
    @Column(name = "file_name")
    private String fileName;

    /**
     * Deadline nộp bài (dùng cho loại ASSIGNMENT)
     */
    @Column(name = "deadline")
    private OffsetDateTime deadline;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private Profile author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id")
    private ClassEntity classEntity;

    @Column(name = "is_deleted")
    @Builder.Default
    private boolean deleted = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
