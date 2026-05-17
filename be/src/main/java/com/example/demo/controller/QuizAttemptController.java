package com.example.demo.controller;

import com.example.demo.dto.QuizSubmissionDTO;
import com.example.demo.model.Answer;
import com.example.demo.model.Question;
import com.example.demo.model.Quiz;
import com.example.demo.model.QuizAttempt;
import com.example.demo.model.StudentAnswer;
import com.example.demo.repository.QuizAttemptRepository;
import com.example.demo.repository.QuizRepository;
import com.example.demo.repository.StudentAnswerRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/quiz-attempts")
@CrossOrigin(origins = "http://localhost:3000")
public class QuizAttemptController {

    @Autowired
    private QuizAttemptRepository attemptRepository;

    @Autowired
    private StudentAnswerRepository answerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuizRepository quizRepository;

    @PostMapping("/submit")
    @Transactional
    public ResponseEntity<?> submitQuiz(@RequestBody QuizSubmissionDTO submission) {
        try {
            // Kiểm tra User có tồn tại không
            if (!userRepository.existsById(submission.getUserId())) {
                return ResponseEntity.badRequest().body(Map.of("message", "User không tồn tại với ID: " + submission.getUserId()));
            }

            Quiz quiz = quizRepository.findById(submission.getQuizId()).orElse(null);
            if (quiz == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Quiz không tồn tại với ID: " + submission.getQuizId()));
            }

            if (quiz.getDeadline() != null && LocalDateTime.now().isAfter(quiz.getDeadline())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Bài quiz đã quá hạn nộp."));
            }

            List<Question> questions = quiz.getQuestions();
            if (questions == null || questions.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Quiz chưa có câu hỏi."));
            }

            Map<UUID, UUID> correctAnswersByQuestion = new HashMap<>();
            Map<UUID, UUID> answerQuestionMap = new HashMap<>();
            for (Question question : questions) {
                if (question.getAnswers() == null) continue;
                for (Answer answer : question.getAnswers()) {
                    answerQuestionMap.put(answer.getId(), question.getId());
                    if (Boolean.TRUE.equals(answer.getIsCorrect())) {
                        correctAnswersByQuestion.put(question.getId(), answer.getId());
                    }
                }
            }

            Map<UUID, UUID> submittedAnswers = new HashMap<>();
            if (submission.getAnswers() != null) {
                for (QuizSubmissionDTO.AnswerDTO answer : submission.getAnswers()) {
                    submittedAnswers.put(answer.getQuestionId(), answer.getSelectedAnswerId());
                }
            }

            int correctCount = 0;
            List<StudentAnswer> answers = questions.stream().map(question -> {
                UUID selectedAnswerId = submittedAnswers.get(question.getId());
                UUID owningQuestionId = selectedAnswerId != null ? answerQuestionMap.get(selectedAnswerId) : null;
                boolean belongsToQuestion = selectedAnswerId == null || question.getId().equals(owningQuestionId);
                boolean isCorrect = belongsToQuestion && selectedAnswerId != null
                        && selectedAnswerId.equals(correctAnswersByQuestion.get(question.getId()));

                StudentAnswer sa = new StudentAnswer();
                sa.setQuestionId(question.getId());
                sa.setSelectedAnswerId(belongsToQuestion ? selectedAnswerId : null);
                sa.setIsCorrect(isCorrect);
                return sa;
            }).collect(Collectors.toList());

            correctCount = (int) answers.stream().filter(a -> Boolean.TRUE.equals(a.getIsCorrect())).count();
            double rawScore = ((double) correctCount / questions.size()) * 10;
            double score = Math.ceil(rawScore * 100) / 100;

            QuizAttempt attempt = new QuizAttempt();
            attempt.setQuizId(submission.getQuizId());
            attempt.setUserId(submission.getUserId());
            attempt.setScore(score);
            attempt.setSubmittedAt(LocalDateTime.now());

            QuizAttempt savedAttempt = attemptRepository.save(attempt);

            answers.forEach(answer -> answer.setAttempt(savedAttempt));

            answerRepository.saveAll(answers);

            return ResponseEntity.ok(savedAttempt);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Error saving submission: " + e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserAttempts(@PathVariable UUID userId) {
        try {
            if (!userRepository.existsById(userId)) {
                return ResponseEntity.ok(List.of());
            }
            return ResponseEntity.ok(attemptRepository.findByUserId(userId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/attempt/{attemptId}/answers")
    public ResponseEntity<?> getAttemptAnswers(@PathVariable UUID attemptId) {
        try {
            return ResponseEntity.ok(answerRepository.findByAttemptId(attemptId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }
}
