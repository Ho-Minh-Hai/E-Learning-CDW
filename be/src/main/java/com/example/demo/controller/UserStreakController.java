package com.example.demo.controller;

import com.example.demo.model.UserStreak;
import com.example.demo.service.UserStreakService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/streaks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Adjust if needed
public class UserStreakController {

    private final UserStreakService userStreakService;

    @PostMapping("/{userId}/update")
    public ResponseEntity<?> updateStreak(@PathVariable UUID userId) {
        try {
            return ResponseEntity.ok(userStreakService.updateStreak(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getStreak(@PathVariable UUID userId) {
        try {
            return ResponseEntity.ok(userStreakService.getStreak(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
