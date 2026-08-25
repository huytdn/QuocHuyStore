package com.quochuystore.backend.repository;

import com.quochuystore.backend.entity.Order;
import com.quochuystore.backend.entity.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Modifying;
import java.util.Optional;
import java.util.UUID;
import java.util.Collection;
import java.util.List;
import java.time.OffsetDateTime;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByUserId(UUID userId, Pageable pageable);

    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    Page<Order> findByUserIdAndStatus(UUID userId, OrderStatus status, Pageable pageable);

    Page<Order> findByReceiverPhoneAndReceiverNameAndUserIsNullAndStatusNotIn(
            String phone, String name, Collection<OrderStatus> statuses, Pageable pageable);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems oi LEFT JOIN FETCH oi.productVariation WHERE o.id = :id")
    Optional<Order> findByIdWithItems(@Param("id") Long id);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems oi LEFT JOIN FETCH oi.productVariation WHERE o.id = :id AND o.user.id = :userId")
    Optional<Order> findByIdAndUserIdWithItems(@Param("id") Long id, @Param("userId") UUID userId);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderItems oi LEFT JOIN FETCH oi.productVariation WHERE o.status = :status AND o.createdAt < :timeLimit")
    List<Order> findByStatusAndCreatedAtBeforeWithItems(@Param("status") OrderStatus status,
            @Param("timeLimit") OffsetDateTime timeLimit, org.springframework.data.domain.Pageable pageable);

    @Modifying
    @Query("UPDATE Order o SET o.status = :newStatus WHERE o.id IN :ids AND o.status = :expectedStatus")
    int updateStatusForIdsConditionally(@Param("ids") List<Long> ids, @Param("newStatus") OrderStatus newStatus, @Param("expectedStatus") OrderStatus expectedStatus);

    @Modifying
    @Query("UPDATE Order o SET o.status = :newStatus WHERE o.id = :id AND o.status = :expectedStatus")
    int updateStatusConditionally(@Param("id") Long id, @Param("newStatus") OrderStatus newStatus, @Param("expectedStatus") OrderStatus expectedStatus);

    @Modifying
    @Query("UPDATE Order o SET o.status = :newStatus WHERE o.id = :id AND o.user.id = :userId AND o.status IN :expectedStatuses")
    int updateStatusAndUserConditionally(@Param("id") Long id, @Param("userId") UUID userId, @Param("newStatus") OrderStatus newStatus, @Param("expectedStatuses") Collection<OrderStatus> expectedStatuses);

    // ==========================================
    // DASHBOARD ANALYTICS QUERIES & PROJECTIONS
    // ==========================================

    interface OrderKpiProjection {
        java.math.BigDecimal getTotalRevenue();
        Long getTotalOrders();
        java.math.BigDecimal getTotalDiscount();
    }

    @Query(value = "SELECT " +
            "COALESCE(SUM(CASE WHEN o.status = 'DELIVERED' THEN o.total_price ELSE 0 END), 0) AS totalRevenue, " +
            "COUNT(o.id) AS totalOrders, " +
            "COALESCE(SUM(o.discount_amount), 0) AS totalDiscount " +
            "FROM orders o " +
            "WHERE o.created_at >= :from AND o.created_at < :to", nativeQuery = true)
    OrderKpiProjection getKpiStatsBetween(@Param("from") OffsetDateTime from, @Param("to") OffsetDateTime to);

    @Query("SELECT COUNT(o.id) FROM Order o WHERE o.status IN (:statuses)")
    long countByStatusIn(@Param("statuses") Collection<OrderStatus> statuses);

    interface TimeSeriesPointProjection {
        String getBucket();
        java.math.BigDecimal getRevenue();
        Long getOrderCount();
    }

    @Query(value = "SELECT " +
            "b.bucket AS bucket, " +
            "COALESCE(SUM(CASE WHEN b.status = 'DELIVERED' THEN b.total_price ELSE 0 END), 0) AS revenue, " +
            "COUNT(b.id) AS orderCount " +
            "FROM (" +
            "    SELECT o.id, o.status, o.total_price, " +
            "           to_char(date_trunc(:bucketUnit, o.created_at), :dateFormat) AS bucket " +
            "    FROM orders o " +
            "    WHERE o.created_at >= :from AND o.created_at < :to" +
            ") b " +
            "GROUP BY b.bucket " +
            "ORDER BY b.bucket ASC", nativeQuery = true)
    List<TimeSeriesPointProjection> getTimeSeriesRevenueBetween(
            @Param("bucketUnit") String bucketUnit,
            @Param("dateFormat") String dateFormat,
            @Param("from") OffsetDateTime from,
            @Param("to") OffsetDateTime to);

    interface PaymentMethodStatProjection {
        String getPaymentMethod();
        java.math.BigDecimal getRevenue();
        Long getOrderCount();
    }

    @Query(value = "SELECT " +
            "o.payment_method AS paymentMethod, " +
            "COALESCE(SUM(CASE WHEN o.status = 'DELIVERED' THEN o.total_price ELSE 0 END), 0) AS revenue, " +
            "COUNT(o.id) AS orderCount " +
            "FROM orders o " +
            "WHERE o.created_at >= :from AND o.created_at < :to " +
            "GROUP BY o.payment_method", nativeQuery = true)
    List<PaymentMethodStatProjection> getPaymentMethodStatsBetween(@Param("from") OffsetDateTime from, @Param("to") OffsetDateTime to);

    interface OrderStatusStatProjection {
        String getStatus();
        Long getCount();
        java.math.BigDecimal getDiscountSum();
    }

    @Query(value = "SELECT " +
            "o.status AS status, " +
            "COUNT(o.id) AS count, " +
            "COALESCE(SUM(o.discount_amount), 0) AS discountSum " +
            "FROM orders o " +
            "WHERE o.created_at >= :from AND o.created_at < :to " +
            "GROUP BY o.status", nativeQuery = true)
    List<OrderStatusStatProjection> getOrderStatusStatsBetween(@Param("from") OffsetDateTime from, @Param("to") OffsetDateTime to);

    interface CustomerOrderStatsProjection {
        Long getPayingCustomersCount();
        Long getRepeatCustomersCount();
        java.math.BigDecimal getTotalRevenue();
    }

    @Query(value = "SELECT " +
            "COUNT(DISTINCT o.user_id) AS payingCustomersCount, " +
            "COUNT(DISTINCT CASE WHEN o.order_count >= 2 THEN o.user_id END) AS repeatCustomersCount, " +
            "COALESCE(SUM(o.user_revenue), 0) AS totalRevenue " +
            "FROM (" +
            "    SELECT user_id, COUNT(id) AS order_count, SUM(total_price) AS user_revenue " +
            "    FROM orders " +
            "    WHERE status = 'DELIVERED' AND user_id IS NOT NULL " +
            "    GROUP BY user_id " +
            ") o", nativeQuery = true)
    CustomerOrderStatsProjection getOverallCustomerOrderStats();
}
