package com.elearning.platform.repository;

import com.elearning.platform.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByTargetClassIdOrderByCreatedAtDesc(UUID classId);
    List<Notification> findBySenderIdOrderByCreatedAtDesc(UUID senderId);
}
