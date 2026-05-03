package com.elearning.platform.repository;

import com.elearning.platform.entity.Conversation;
import com.elearning.platform.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    @Query(value = "SELECT * FROM conversations WHERE " +
           "(least(user1_id, user2_id) = least(:u1, :u2) AND " +
           "greatest(user1_id, user2_id) = greatest(:u1, :u2)) LIMIT 1", nativeQuery = true)
    Optional<Conversation> findConversationBetweenUsers(@Param("u1") UUID u1, @Param("u2") UUID u2);

    @Query("SELECT c FROM Conversation c WHERE c.user1.id = :userId OR c.user2.id = :userId ORDER BY c.updatedAt DESC")
    List<Conversation> findAllByUserId(@Param("userId") UUID userId);
}
