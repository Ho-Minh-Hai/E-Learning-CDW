package com.elearning.platform.service;

import com.elearning.platform.entity.Conversation;
import com.elearning.platform.entity.Message;
import com.elearning.platform.entity.Profile;
import com.elearning.platform.repository.ConversationRepository;
import com.elearning.platform.repository.MessageRepository;
import com.elearning.platform.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import com.elearning.platform.dto.MessageDTO;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final ProfileRepository profileRepository;

    public Conversation getOrCreateConversation(UUID user1Id, UUID user2Id) {
        return conversationRepository.findConversationBetweenUsers(user1Id, user2Id)
                .orElseGet(() -> {
                    Profile u1 = profileRepository.findById(user1Id)
                            .orElseThrow(() -> new RuntimeException("User 1 not found"));
                    Profile u2 = profileRepository.findById(user2Id)
                            .orElseThrow(() -> new RuntimeException("User 2 not found"));
                    
                    Conversation newConversation = Conversation.builder()
                            .user1(u1)
                            .user2(u2)
                            .build();
                    return conversationRepository.save(newConversation);
                });
    }

    public List<Conversation> getUserConversations(UUID userId) {
        return conversationRepository.findAllByUserId(userId);
    }

    public List<Message> getConversationMessages(UUID conversationId) {
        return messageRepository.findAllByConversationIdOrderByCreatedAtAsc(conversationId);
    }

    @Transactional
    public Message saveMessage(MessageDTO messageDto) {
        try {
            Conversation conv = conversationRepository.findById(messageDto.getConversationId())
                    .orElseThrow(() -> new RuntimeException("Conversation not found with ID: " + messageDto.getConversationId()));
            Profile sender = profileRepository.findById(messageDto.getSenderId())
                    .orElseThrow(() -> new RuntimeException("Sender not found with ID: " + messageDto.getSenderId()));

            Message message = Message.builder()
                    .conversation(conv)
                    .sender(sender)
                    .content(messageDto.getContent())
                    .messageType(messageDto.getMessageType() != null ? messageDto.getMessageType() : "text")
                    .build();

            Message saved = messageRepository.save(message);
            
            // Update conversation updated_at
            conv.setUpdatedAt(OffsetDateTime.now());
            conversationRepository.save(conv);
            
            return saved;
        } catch (Exception e) {
            System.err.println("CRITICAL ERROR SAVING MESSAGE: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
