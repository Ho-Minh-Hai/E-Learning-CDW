package com.example.demo.repository;

import com.example.demo.model.MessageEdit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageEditRepository extends JpaRepository<MessageEdit, UUID> {
    List<MessageEdit> findByMessageIdOrderByEditedAtAsc(UUID messageId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM MessageEdit me WHERE me.message.id = :messageId")
    void deleteByMessageId(@org.springframework.data.repository.query.Param("messageId") UUID messageId);
}
