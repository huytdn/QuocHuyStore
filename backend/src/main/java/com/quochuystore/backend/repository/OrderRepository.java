package com.quochuystore.backend.repository;

import com.quochuystore.backend.entity.Order;
import com.quochuystore.backend.entity.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByUserId(UUID userId, Pageable pageable);

    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    Page<Order> findByUserIdAndStatus(UUID userId, OrderStatus status, Pageable pageable);

    Page<Order> findByReceiverPhoneAndReceiverNameAndUserIsNullAndStatusNotIn(
            String phone, String name, java.util.Collection<OrderStatus> statuses, Pageable pageable);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems WHERE o.id = :id")
    Optional<Order> findByIdWithItems(@Param("id") Long id);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems WHERE o.id = :id AND o.user.id = :userId")
    Optional<Order> findByIdAndUserIdWithItems(@Param("id") Long id, @Param("userId") UUID userId);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderItems WHERE o.status = :status AND o.createdAt < :timeLimit")
    java.util.List<Order> findByStatusAndCreatedAtBeforeWithItems(@Param("status") OrderStatus status,
            @Param("timeLimit") java.time.OffsetDateTime timeLimit);
}
