package com.elearning.platform.service;

import com.elearning.platform.dto.ClassResponseDTO;
import com.elearning.platform.entity.ClassEntity;
import com.elearning.platform.entity.ClassMemberEntity;
import com.elearning.platform.entity.Profile;
import com.elearning.platform.repository.ClassRepository;
import com.elearning.platform.repository.ClassMemberRepository;
import com.elearning.platform.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassService {

    private final ClassRepository classRepository;
    private final ProfileRepository profileRepository;
    private final ClassMemberRepository classMemberRepository;
    private final SecureRandom random = new SecureRandom();

    private String generateUniqueJoinCode() {
        String code;
        do {
            int num = 100000 + random.nextInt(900000);
            code = String.valueOf(num);
        } while (classRepository.existsByJoinCode(code));
        return code;
    }

    @Transactional
    public ClassResponseDTO createClass(String name, UUID teacherId) {
        Profile teacher = profileRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        if (!"teacher".equals(teacher.getRole()) && !"admin".equals(teacher.getRole())) {
            throw new RuntimeException("Only teachers can create classes");
        }

        ClassEntity newClass = ClassEntity.builder()
                .name(name)
                .teacher(teacher)
                .joinCode(generateUniqueJoinCode())
                .build();
        
        ClassEntity saved = classRepository.save(newClass);
        return mapToDto(saved);
    }

    @Transactional
    public ClassResponseDTO joinClass(String joinCode, UUID studentId) {
        ClassEntity classEntity = classRepository.findByJoinCode(joinCode)
                .orElseThrow(() -> new RuntimeException("Invalid join code"));

        Profile student = profileRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (!classMemberRepository.existsByClassEntityIdAndStudentId(classEntity.getId(), studentId)) {
            ClassMemberEntity member = ClassMemberEntity.builder()
                    .classEntity(classEntity)
                    .studentId(studentId)
                    .build();
            classMemberRepository.save(member);
        }

        return mapToDto(classEntity);
    }

    public List<ClassResponseDTO> getClassesByTeacher(UUID teacherId) {
        return classRepository.findByTeacherId(teacherId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ClassResponseDTO> getClassesByStudent(UUID studentId) {
        return classMemberRepository.findByStudentId(studentId).stream()
                .map(ClassMemberEntity::getClassEntity)
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private ClassResponseDTO mapToDto(ClassEntity entity) {
        int studentCount = classMemberRepository.countByClassEntityId(entity.getId());
        return ClassResponseDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .teacherId(entity.getTeacher().getId())
                .teacherName(entity.getTeacher().getFullName())
                .joinCode(entity.getJoinCode())
                .createdAt(entity.getCreatedAt())
                .studentCount(studentCount)
                .build();
    }
}
