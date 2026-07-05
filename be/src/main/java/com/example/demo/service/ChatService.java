package com.example.demo.service;

import com.example.demo.model.Conversation;
import com.example.demo.model.Message;
import com.example.demo.model.MessageEdit;
import com.example.demo.model.User;
import com.example.demo.repository.ConversationRepository;
import com.example.demo.repository.MessageRepository;
import com.example.demo.repository.MessageEditRepository;
import com.example.demo.model.BannedKeyword;
import com.example.demo.repository.BannedKeywordRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ChatService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private MessageEditRepository messageEditRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BannedKeywordRepository bannedKeywordRepository;

    private static final long RECALL_LIMIT_HOURS = 3;

    public List<Conversation> getConversationsForUser(UUID userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return List.of();
        }
        return conversationRepository.findByUser1OrUser2OrderByCreatedAtDesc(user, user);
    }

    public Conversation getOrCreateConversation(UUID user1Id, UUID user2Id) {
        User firstUser = userRepository.findById(user1Id)
                .orElseThrow(() -> new RuntimeException("Tài khoản của bạn chưa được đồng bộ với máy chủ."));
        User secondUser = userRepository.findById(user2Id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người nhận tin nhắn."));

        User u1 = user1Id.compareTo(user2Id) <= 0 ? firstUser : secondUser;
        User u2 = user1Id.compareTo(user2Id) <= 0 ? secondUser : firstUser;
        Optional<Conversation> existing = conversationRepository.findBetweenUsers(u1, u2);
        if (existing.isPresent()) {
            return existing.get();
        }

        try {
            return conversationRepository.save(Conversation.builder().user1(u1).user2(u2).build());
        } catch (DataIntegrityViolationException exception) {
            return conversationRepository.findBetweenUsers(u1, u2).orElseThrow(() -> exception);
        }
    }

    public Message saveMessage(UUID conversationId, UUID senderId, String content) {
        if (content != null) {
            List<BannedKeyword> bannedKeywords = bannedKeywordRepository.findAll();
            for (BannedKeyword bk : bannedKeywords) {
                String keyword = bk.getKeyword().toLowerCase();
                if (content.toLowerCase().contains(keyword)) {
                    throw new IllegalArgumentException("Không thể thực thi vì có từ khóa cấm: " + bk.getKeyword());
                }
            }
        }
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(content)
                .messageType("text")
                .isRead(false)
                .isEdited(false)
                .createdAt(LocalDateTime.now())
                .build();

        return messageRepository.save(message);
    }

    public List<Message> getMessages(UUID conversationId) {
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
    }

    public Message updateMessage(UUID messageId, String newContent) {
        if (newContent != null) {
            List<BannedKeyword> bannedKeywords = bannedKeywordRepository.findAll();
            for (BannedKeyword bk : bannedKeywords) {
                String keyword = bk.getKeyword().toLowerCase();
                if (newContent.toLowerCase().contains(keyword)) {
                    throw new IllegalArgumentException("Không thể thực thi vì có từ khóa cấm: " + bk.getKeyword());
                }
            }
        }
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        // Lưu lịch sử chỉnh sửa
        MessageEdit messageEdit = MessageEdit.builder()
                .message(message)
                .oldContent(message.getContent())
                .editedAt(LocalDateTime.now())
                .build();
        messageEditRepository.save(messageEdit);

        // Cập nhật nội dung tin nhắn
        message.setContent(newContent);
        message.setIsEdited(true);
        message.setUpdatedAt(LocalDateTime.now());

        return messageRepository.save(message);
    }

    public boolean canRecallMessage(UUID messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        LocalDateTime createdAt = message.getCreatedAt();
        LocalDateTime now = LocalDateTime.now();
        
        long hours = java.time.temporal.ChronoUnit.HOURS.between(createdAt, now);
        
        return hours < RECALL_LIMIT_HOURS;
    }

    public void recallMessage(UUID messageId) {
        if (!canRecallMessage(messageId)) {
            throw new RuntimeException("Tin nhắn đã gửi quá 3 giờ, không thể thu hồi");
        }

        messageRepository.deleteById(messageId);
    }

    public List<MessageEdit> getMessageEdits(UUID messageId) {
        return messageEditRepository.findByMessageIdOrderByEditedAtAsc(messageId);
    }
    
    public long countUnreadMessages(UUID userId) {
        if (!userRepository.existsById(userId)) {
            return 0;
        }
        return messageRepository.countUnreadMessagesByUserId(userId);
    }

    @org.springframework.transaction.annotation.Transactional
    public void markAsRead(UUID conversationId, UUID userId) {
        if (!userRepository.existsById(userId)) {
            return;
        }
        messageRepository.markAsRead(conversationId, userId, LocalDateTime.now());
    }
}
