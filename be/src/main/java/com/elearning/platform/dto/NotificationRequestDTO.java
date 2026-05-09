package com.elearning.platform.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class NotificationRequestDTO {
    private UUID senderId;
    private UUID classId;
    private String type;
    private String title;
    private String content;
    private String linkUrl;
}
