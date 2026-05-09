package com.elearning.platform.controller;

import com.elearning.platform.dto.NotificationRequestDTO;
import com.elearning.platform.entity.Notification;
import com.elearning.platform.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<Notification>> getNotificationsByClass(@PathVariable UUID classId) {
        return ResponseEntity.ok(notificationService.getNotificationsByClass(classId));
    }

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody NotificationRequestDTO dto) {
        return ResponseEntity.ok(notificationService.createNotification(dto));
    }
}
