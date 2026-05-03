package com.elearning.platform.controller;

import com.elearning.platform.dto.ConversationResponseDTO;
import com.elearning.platform.dto.MessageDTO;
import com.elearning.platform.dto.MessageResponseDTO;
import com.elearning.platform.entity.Conversation;
import com.elearning.platform.entity.Message;
import com.elearning.platform.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/conversation")
    public ResponseEntity<ConversationResponseDTO> getOrCreateConversation(
            @RequestParam UUID user1Id,
            @RequestParam UUID user2Id) {
        Conversation conv = chatService.getOrCreateConversation(user1Id, user2Id);
        return ResponseEntity.ok(ConversationResponseDTO.from(conv));
    }

    @GetMapping("/conversations/{userId}")
    public ResponseEntity<List<ConversationResponseDTO>> getUserConversations(@PathVariable UUID userId) {
        List<ConversationResponseDTO> dtos = chatService.getUserConversations(userId)
                .stream()
                .map(ConversationResponseDTO::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/messages/{conversationId}")
    public ResponseEntity<List<MessageResponseDTO>> getConversationMessages(@PathVariable UUID conversationId) {
        List<MessageResponseDTO> dtos = chatService.getConversationMessages(conversationId)
                .stream()
                .map(MessageResponseDTO::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/messages")
    public ResponseEntity<MessageResponseDTO> sendMessage(@RequestBody MessageDTO messageDto) {
        Message saved = chatService.saveMessage(messageDto);
        return ResponseEntity.ok(MessageResponseDTO.from(saved));
    }
}
