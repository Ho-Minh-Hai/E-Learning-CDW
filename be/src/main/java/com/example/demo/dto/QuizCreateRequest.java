package com.example.demo.dto;

import lombok.Data;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

@Data
public class QuizCreateRequest {
    @NotNull(message = "quiz is required")
    @Valid
    private QuizDTO quiz;

    @NotEmpty(message = "questions is required")
    @Valid
    private List<QuestionDTO> questions;

    @Data
    public static class QuizDTO {

        @NotBlank(message = "quiz.title is required")
        private String title;
        private Integer durationMinutes;

        @NotNull(message = "quiz.classId is required")
        private UUID classId;

        @NotNull(message = "quiz.createdBy is required")
        private UUID createdBy;
        private java.time.LocalDateTime deadline;
    }

    @Data
    public static class QuestionDTO {

        @NotBlank(message = "question.content is required")
        private String content;

        @NotNull(message = "question.questionOrder is required")
        private Integer questionOrder;

        @NotEmpty(message = "question.answers is required")
        @Valid
        private List<AnswerDTO> answers;
    }

    @Data
    public static class AnswerDTO {

        @NotBlank(message = "answer.content is required")
        private String content;

        @NotNull(message = "answer.isCorrect is required")
        private Boolean isCorrect;

        @NotNull(message = "answer.answerOrder is required")
        private Integer answerOrder;
    }
}
