package com.elearning.platform.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class MessageDTO {
    private UUID conversationId;
    private UUID senderId;
    private String content;
    private String messageType;
}
