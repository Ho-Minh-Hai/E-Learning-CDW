package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminPostDTO {
    private UUID id;
    private String title;
    private String content;
    private String type;
    private LocalDateTime createdAt;
    private UUID authorId;
    private String authorName;
    private String authorEmail;
    private UUID classId;
    private String className;
}
