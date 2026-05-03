package com.elearning.platform.controller;

import com.elearning.platform.dto.ClassResponseDTO;
import com.elearning.platform.service.ClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ClassController {

    private final ClassService classService;

    @PostMapping
    public ResponseEntity<ClassResponseDTO> createClass(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        UUID teacherId = UUID.fromString(payload.get("teacherId"));
        return ResponseEntity.ok(classService.createClass(name, teacherId));
    }

    @PostMapping("/join")
    public ResponseEntity<ClassResponseDTO> joinClass(@RequestBody Map<String, String> payload) {
        String joinCode = payload.get("joinCode");
        UUID studentId = UUID.fromString(payload.get("studentId"));
        return ResponseEntity.ok(classService.joinClass(joinCode, studentId));
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<ClassResponseDTO>> getClassesByTeacher(@PathVariable UUID teacherId) {
        return ResponseEntity.ok(classService.getClassesByTeacher(teacherId));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ClassResponseDTO>> getClassesByStudent(@PathVariable UUID studentId) {
        return ResponseEntity.ok(classService.getClassesByStudent(studentId));
    }
}
