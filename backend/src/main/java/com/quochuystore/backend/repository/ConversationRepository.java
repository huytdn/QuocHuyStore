package com.quochuystore.backend.repository;

import com.quochuystore.backend.entity.Conversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c JOIN FETCH c.user WHERE c.user.id = :userId")
    Optional<Conversation> findByUserId(@Param("userId") UUID userId);

    @Query("SELECT c FROM Conversation c JOIN FETCH c.user WHERE c.id = :id")
    Optional<Conversation> findWithUserById(@Param("id") Long id);

    @Query(value = "SELECT c FROM Conversation c JOIN FETCH c.user ORDER BY c.updatedAt DESC",
           countQuery = "SELECT COUNT(c) FROM Conversation c")
    Page<Conversation> findAllByOrderByUpdatedAtDesc(Pageable pageable);

    @Query(value = "SELECT c FROM Conversation c JOIN FETCH c.user WHERE LOWER(c.user.username) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.user.displayName) LIKE LOWER(CONCAT('%', :search, '%')) ORDER BY c.updatedAt DESC",
           countQuery = "SELECT COUNT(c) FROM Conversation c WHERE LOWER(c.user.username) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.user.displayName) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Conversation> searchConversations(@Param("search") String search, Pageable pageable);

    boolean existsByUserId(UUID userId);

    @Query("SELECT c FROM Conversation c JOIN FETCH c.user WHERE c.user.id IN :userIds")
    List<Conversation> findByUserIds(@Param("userIds") List<UUID> userIds);
}
