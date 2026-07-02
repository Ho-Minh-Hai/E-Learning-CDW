package com.example.demo.controller;

import com.example.demo.dto.ClassDTO;
import com.example.demo.model.ClassEntity;
import com.example.demo.service.ClassService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/classes")
@CrossOrigin(origins = "*", allowedHeaders = "*") // Cho phép tất cả các nguồn và header để fix lỗi CORS
public class ClassController {

    @Autowired
    private ClassService classService;

    @PostMapping("/create")
    public ResponseEntity<?> createClass(@Valid @RequestBody ClassEntity classEntity) {
        try {
            ClassEntity createdClass = classService.createClass(classEntity);
            return ResponseEntity.ok(createdClass);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không thể tạo lớp: " + e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getClasses(@PathVariable UUID userId, @RequestParam(required = false) String role) {
        try {
            List<ClassDTO> classes;
            if ("1".equals(role)) {
                classes = classService.getClassesByTeacher(userId);
            } else {
                classes = classService.getClassesByStudent(userId);
            }
            return ResponseEntity.ok(classes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/join")
    public ResponseEntity<?> joinClass(@Valid @RequestBody JoinClassRequest payload) {
        try {
            Optional<ClassEntity> classOpt = classService.findByJoinCode(payload.getJoinCode());
            
            if (classOpt.isPresent()) {
                classService.joinClass(payload.getStudentId(), classOpt.get().getId());
                return ResponseEntity.ok(Map.of("message", "Tham gia thành công lớp " + classOpt.get().getName()));
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Mã join code không tồn tại."));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    @DeleteMapping("/{classId}/students/{studentId}")
    public ResponseEntity<?> removeStudent(@PathVariable UUID classId, @PathVariable UUID studentId) {
        try {
            classService.removeStudentFromClass(studentId, classId);
            return ResponseEntity.ok(Map.of("message", "Đã xóa học sinh ra khỏi lớp."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @Data
    public static class JoinClassRequest {
        @NotBlank(message = "join_code is required")
        private String joinCode;

        @NotNull(message = "student_id is required")
        private UUID studentId;
    }
}
