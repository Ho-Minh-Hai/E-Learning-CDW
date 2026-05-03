package com.elearning.platform.dto;

import com.elearning.platform.entity.Message;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class MessageResponseDTO {
    private UUID id;
    private UUID conversationId;
    private SenderDTO sender;
    private String content;
    private String messageType;
    private boolean isRead;
    private OffsetDateTime createdAt;

    @Data
    public static class SenderDTO {
        private UUID id;
        private String fullName;
        private String avatarUrl;
    }

    public static MessageResponseDTO from(Message m) {
        MessageResponseDTO dto = new MessageResponseDTO();
        dto.setId(m.getId());
        dto.setConversationId(m.getConversation().getId());
        dto.setContent(m.getContent());
        dto.setMessageType(m.getMessageType());
        dto.setRead(m.isRead());
        dto.setCreatedAt(m.getCreatedAt());

        SenderDTO sender = new SenderDTO();
        sender.setId(m.getSender().getId());
        sender.setFullName(m.getSender().getFullName());
        sender.setAvatarUrl(m.getSender().getAvatarUrl());
        dto.setSender(sender);

        return dto;
    }
}
