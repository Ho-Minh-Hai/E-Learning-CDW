package com.elearning.platform.repository;

import com.elearning.platform.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface PostRepository extends JpaRepository<Post, UUID> {

    @Query("SELECT p FROM Post p WHERE p.deleted = false ORDER BY p.createdAt DESC")
    List<Post> findAllActive();

    @Query("SELECT p FROM Post p WHERE p.deleted = false AND p.postType = :postType ORDER BY p.createdAt DESC")
    List<Post> findAllActiveByType(@Param("postType") String postType);

    @Query("SELECT p FROM Post p WHERE p.deleted = false AND p.author.id = :authorId ORDER BY p.createdAt DESC")
    List<Post> findAllActiveByAuthor(@Param("authorId") UUID authorId);

    @Query("SELECT p FROM Post p WHERE p.deleted = false AND p.classEntity.id = :classId ORDER BY p.createdAt DESC")
    List<Post> findAllActiveByClass(@Param("classId") UUID classId);

    @Query("SELECT p FROM Post p WHERE p.deleted = false AND p.classEntity.id IN :classIds ORDER BY p.createdAt DESC")
    List<Post> findAllActiveByClasses(@Param("classIds") List<UUID> classIds);

    @Query("SELECT p FROM Post p WHERE p.deleted = false AND p.classEntity IS NULL ORDER BY p.createdAt DESC")
    List<Post> findAllActiveWithoutClass();
}
