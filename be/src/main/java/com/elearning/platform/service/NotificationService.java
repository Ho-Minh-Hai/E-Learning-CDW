package com.elearning.platform.service;

import com.elearning.platform.dto.NotificationRequestDTO;
import com.elearning.platform.entity.ClassEntity;
import com.elearning.platform.entity.Notification;
import com.elearning.platform.entity.Profile;
import com.elearning.platform.repository.ClassRepository;
import com.elearning.platform.repository.NotificationRepository;
import com.elearning.platform.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ProfileRepository profileRepository;
    private final ClassRepository classRepository;

    public List<Notification> getNotificationsByClass(UUID classId) {
        return notificationRepository.findByTargetClassIdOrderByCreatedAtDesc(classId);
    }

    @Transactional
    public Notification createNotification(NotificationRequestDTO dto) {
        Profile sender = profileRepository.findById(dto.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        ClassEntity targetClass = null;
        if (dto.getClassId() != null) {
            targetClass = classRepository.findById(dto.getClassId())
                    .orElseThrow(() -> new RuntimeException("Class not found"));
        }

        Notification notification = Notification.builder()
                .sender(sender)
                .targetClass(targetClass)
                .type(dto.getType().toUpperCase())
                .title(dto.getTitle())
                .content(dto.getContent())
                .linkUrl(dto.getLinkUrl())
                .build();

        return notificationRepository.save(notification);
    }
}
