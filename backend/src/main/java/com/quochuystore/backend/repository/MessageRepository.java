package com.quochuystore.backend.repository;

import com.quochuystore.backend.entity.Message;
import com.quochuystore.backend.entity.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query(value = "SELECT m FROM Message m JOIN FETCH m.sender LEFT JOIN FETCH m.receiver WHERE m.conversation.id = :conversationId ORDER BY m.createdAt DESC, m.id DESC",
           countQuery = "SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :conversationId")
    Page<Message> findByConversationIdWithSenderOrderByCreatedAtDesc(@Param("conversationId") Long conversationId, Pageable pageable);

    long countByConversationId(Long conversationId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :conversationId AND m.isRead = false AND m.receiver.id = :receiverId")
    long countUnreadByConversationAndReceiver(@Param("conversationId") Long conversationId, @Param("receiverId") UUID receiverId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :conversationId AND m.isRead = false AND m.sender.role = :senderRole")
    long countUnreadByConversationAndSenderRole(@Param("conversationId") Long conversationId, @Param("senderRole") UserRole senderRole);

    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.conversation.id = :conversationId AND m.receiver.id = :receiverId AND m.isRead = false")
    int markMessagesAsReadByReceiver(@Param("conversationId") Long conversationId, @Param("receiverId") UUID receiverId);

    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.conversation.id = :conversationId AND m.sender.role = :senderRole AND m.isRead = false")
    int markMessagesAsReadBySenderRole(@Param("conversationId") Long conversationId, @Param("senderRole") UserRole senderRole);
}
