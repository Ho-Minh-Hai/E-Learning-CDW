package com.example.demo.controller;

import com.example.demo.model.Conversation;
import com.example.demo.model.Message;
import com.example.demo.model.MessageEdit;
import com.example.demo.service.ChatService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @GetMapping("/conversations/{userId}")
    public ResponseEntity<List<Conversation>> getConversations(@PathVariable UUID userId) {
        return ResponseEntity.ok(chatService.getConversationsForUser(userId));
    }

    @PostMapping("/conversations")
    public ResponseEntity<?> getOrCreateConversation(@Valid @RequestBody CreateConversationRequest payload) {
        try {
            if (payload.getUser1Id().equals(payload.getUser2Id())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Không thể tự tạo cuộc trò chuyện với chính mình."));
            }
            return ResponseEntity.ok(chatService.getOrCreateConversation(
                    payload.getUser1Id(),
                    payload.getUser2Id()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/messages/{conversationId}")
    public ResponseEntity<List<Message>> getMessages(@PathVariable UUID conversationId) {
        return ResponseEntity.ok(chatService.getMessages(conversationId));
    }

    @PostMapping("/messages")
    public ResponseEntity<?> sendMessage(@Valid @RequestBody SendMessageRequest payload) {
        try {
            return ResponseEntity.ok(chatService.saveMessage(
                    payload.getConversationId(),
                    payload.getSenderId(),
                    payload.getContent()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/messages/{messageId}")
    public ResponseEntity<Message> editMessage(
            @PathVariable UUID messageId,
            @Valid @RequestBody EditMessageRequest payload) {
        return ResponseEntity.ok(chatService.updateMessage(messageId, payload.getContent()));
    }

    @GetMapping("/messages/{messageId}/edits")
    public ResponseEntity<List<MessageEdit>> getMessageEdits(@PathVariable UUID messageId) {
        return ResponseEntity.ok(chatService.getMessageEdits(messageId));
    }

    @GetMapping("/messages/{messageId}/can-recall")
    public ResponseEntity<Map<String, Boolean>> canRecallMessage(@PathVariable UUID messageId) {
        boolean canRecall = chatService.canRecallMessage(messageId);
        return ResponseEntity.ok(Map.of("canRecall", canRecall));
    }

    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<Void> deleteMessage(@PathVariable UUID messageId) {
        chatService.recallMessage(messageId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread-count/{userId}")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable UUID userId) {
        long count = chatService.countUnreadMessages(userId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PostMapping("/mark-as-read")
    public ResponseEntity<Void> markAsRead(@Valid @RequestBody MarkAsReadRequest payload) {
        chatService.markAsRead(payload.getConversationId(), payload.getUserId());
        return ResponseEntity.ok().build();
    }

    @Data
    public static class CreateConversationRequest {
        @NotNull(message = "user1Id is required")
        private UUID user1Id;

        @NotNull(message = "user2Id is required")
        private UUID user2Id;
    }

    @Data
    public static class SendMessageRequest {
        @NotNull(message = "conversationId is required")
        private UUID conversationId;

        @NotNull(message = "senderId is required")
        private UUID senderId;

        @NotBlank(message = "content is required")
        private String content;
    }

    @Data
    public static class EditMessageRequest {
        @NotBlank(message = "content is required")
        private String content;
    }

    @Data
    public static class MarkAsReadRequest {
        @NotNull(message = "conversationId is required")
        private UUID conversationId;

        @NotNull(message = "userId is required")
        private UUID userId;
    }
}
