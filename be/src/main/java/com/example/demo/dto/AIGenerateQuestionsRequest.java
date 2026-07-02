package com.example.demo.dto;

import lombok.Data;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Data
public class AIGenerateQuestionsRequest {
    @NotBlank(message = "fileContent is required")
    private String fileContent;      // Nội dung file (text)

    @NotNull(message = "numberOfQuestions is required")
    @Min(value = 1, message = "numberOfQuestions must be greater than 0")
    @Max(value = 100, message = "numberOfQuestions must be at most 100")
    private Integer numberOfQuestions; // Số câu hỏi muốn generate

    @Size(max = 200, message = "topic must be at most 200 characters")
    private String topic;             // (Optional) Chủ đề câu hỏi
}
