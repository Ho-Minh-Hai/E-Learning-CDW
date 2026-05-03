package com.elearning.platform.dto;

import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class PostRequestDTO {
    private String postType;   // ANNOUNCEMENT | DOCUMENT | ASSIGNMENT
    private String title;
    private String content;
    private String fileUrl;    // dùng cho DOCUMENT
    private String fileName;   // dùng cho DOCUMENT
    private OffsetDateTime deadline; // dùng cho ASSIGNMENT
    private UUID authorId;
}
