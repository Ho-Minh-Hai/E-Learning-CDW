package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.service.UserService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Hoặc domain của FE bạn
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User user = userService.processUserLogin(
                request.getId(),
                request.getEmail(),
                request.getFullName(),
                request.getAvatarUrl(),
                request.getLastSignInAt()
            );
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi đăng nhập backend: " + e.getMessage()));
        }
    }

    @GetMapping("/users/search")
    public ResponseEntity<List<SearchUserResponse>> searchUsers(
            @RequestParam String query,
            @RequestParam UUID excludeId) {
        List<SearchUserResponse> users = userService.searchUsers(query, excludeId).stream()
                .map(user -> new SearchUserResponse(
                        user.getId(),
                        user.getFullName(),
                        user.getAvatarUrl(),
                        user.getEmail()))
                .toList();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{id}/profile")
    public ResponseEntity<?> updateProfile(
            @PathVariable UUID id,
            @RequestBody UpdateProfileRequest request) {
        try {
            User user = userService.updateUserProfile(
                    id,
                    request.getFullName(),
                    request.getSchool(),
                    request.getAvatarUrl()
            );
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi cập nhật thông tin: " + e.getMessage()));
        }
    }

    public record SearchUserResponse(UUID id, String fullName, String avatarUrl, String email) {
    }

    @Data
    public static class LoginRequest {
        private UUID id;
        private String email;
        private String fullName;
        private String avatarUrl;
        private java.time.OffsetDateTime lastSignInAt;
    }

    @Data
    public static class UpdateProfileRequest {
        private String fullName;
        private String school;
        private String avatarUrl;
    }
}
