package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.model.BannedKeyword;
import com.example.demo.model.User;
import com.example.demo.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<AdminDashboardStatsDTO> getStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // --- Users ---
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<User> updateUserRole(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        String role = body.get("role");
        return ResponseEntity.ok(adminService.updateUserRole(id, role));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable UUID id) {
        try {
            adminService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "Xóa người dùng thành công."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không thể xóa người dùng: " + e.getMessage()));
        }
    }

    // --- Classes ---
    @GetMapping("/classes")
    public ResponseEntity<List<AdminClassDTO>> getAllClasses() {
        return ResponseEntity.ok(adminService.getAllClasses());
    }

    @DeleteMapping("/classes/{id}")
    public ResponseEntity<?> deleteClass(@PathVariable UUID id) {
        try {
            adminService.deleteClass(id);
            return ResponseEntity.ok(Map.of("message", "Xóa lớp học thành công."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không thể xóa lớp học: " + e.getMessage()));
        }
    }

    // --- Comments ---
    @GetMapping("/comments")
    public ResponseEntity<List<AdminCommentDTO>> getAllComments() {
        return ResponseEntity.ok(adminService.getAllComments());
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable UUID id) {
        try {
            adminService.deleteComment(id);
            return ResponseEntity.ok(Map.of("message", "Xóa bình luận thành công."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không thể xóa bình luận: " + e.getMessage()));
        }
    }

    // --- Posts ---
    @GetMapping("/posts")
    public ResponseEntity<List<AdminPostDTO>> getAllPosts() {
        return ResponseEntity.ok(adminService.getAllPosts());
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> deletePost(@PathVariable UUID id) {
        try {
            adminService.deletePost(id);
            return ResponseEntity.ok(Map.of("message", "Xóa bài đăng thành công."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không thể xóa bài đăng: " + e.getMessage()));
        }
    }

    // --- Banned Keywords ---
    @GetMapping("/banned-keywords")
    public ResponseEntity<List<BannedKeyword>> getAllBannedKeywords() {
        return ResponseEntity.ok(adminService.getAllBannedKeywords());
    }

    @PostMapping("/banned-keywords")
    public ResponseEntity<BannedKeyword> addBannedKeyword(@RequestBody Map<String, String> body) {
        String keyword = body.get("keyword");
        return ResponseEntity.ok(adminService.addBannedKeyword(keyword));
    }

    @DeleteMapping("/banned-keywords/{id}")
    public ResponseEntity<?> deleteBannedKeyword(@PathVariable UUID id) {
        try {
            adminService.deleteBannedKeyword(id);
            return ResponseEntity.ok(Map.of("message", "Xóa từ khóa cấm thành công."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không thể xóa từ khóa cấm: " + e.getMessage()));
        }
    }
}
