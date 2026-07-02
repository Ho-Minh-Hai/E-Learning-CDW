package com.example.demo.dto;

import lombok.Data;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

@Data
public class QuizSubmissionDTO {

    @NotNull(message = "quizId is required")
    private UUID quizId;

    @NotNull(message = "userId is required")
    private UUID userId;
    private Double score;

    @NotEmpty(message = "answers is required")
    @Valid
    private List<AnswerDTO> answers;

    @Data
    public static class AnswerDTO {

        @NotNull(message = "questionId is required")
        private UUID questionId;
        private UUID selectedAnswerId;
        private Boolean isCorrect;
    }
}
