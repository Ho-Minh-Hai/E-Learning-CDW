package com.elearning.platform.repository;

import com.elearning.platform.entity.ClassMemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClassMemberRepository extends JpaRepository<ClassMemberEntity, UUID> {
    List<ClassMemberEntity> findByStudentId(UUID studentId);
    List<ClassMemberEntity> findAllByStudentId(UUID studentId);
    boolean existsByClassEntityIdAndStudentId(UUID classId, UUID studentId);
    int countByClassEntityId(UUID classId);
}
