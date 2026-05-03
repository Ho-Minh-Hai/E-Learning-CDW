package com.elearning.platform.dto;

import com.elearning.platform.entity.Conversation;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class ConversationResponseDTO {
    private UUID id;
    private UserDTO user1;
    private UserDTO user2;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    @Data
    public static class UserDTO {
        private UUID id;
        private String fullName;
        private String avatarUrl;
        private String role;
    }

    public static ConversationResponseDTO from(Conversation c) {
        ConversationResponseDTO dto = new ConversationResponseDTO();
        dto.setId(c.getId());
        dto.setCreatedAt(c.getCreatedAt());
        dto.setUpdatedAt(c.getUpdatedAt());

        UserDTO u1 = new UserDTO();
        u1.setId(c.getUser1().getId());
        u1.setFullName(c.getUser1().getFullName());
        u1.setAvatarUrl(c.getUser1().getAvatarUrl());
        u1.setRole(c.getUser1().getRole());
        dto.setUser1(u1);

        UserDTO u2 = new UserDTO();
        u2.setId(c.getUser2().getId());
        u2.setFullName(c.getUser2().getFullName());
        u2.setAvatarUrl(c.getUser2().getAvatarUrl());
        u2.setRole(c.getUser2().getRole());
        dto.setUser2(u2);

        return dto;
    }
}
