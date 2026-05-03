package com.elearning.platform.repository;

import com.elearning.platform.entity.ClassEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClassRepository extends JpaRepository<ClassEntity, UUID> {
    Optional<ClassEntity> findByJoinCode(String joinCode);
    boolean existsByJoinCode(String joinCode);
    List<ClassEntity> findByTeacherId(UUID teacherId);
}
