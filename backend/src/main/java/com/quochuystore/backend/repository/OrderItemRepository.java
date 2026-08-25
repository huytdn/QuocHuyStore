package com.quochuystore.backend.repository;

import com.quochuystore.backend.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {

    List<OrderItem> findByOrderIdIn(Collection<Long> orderIds);

    // ==========================================
    // DASHBOARD ANALYTICS QUERIES & PROJECTIONS
    // ==========================================

    interface TopProductProjection {
        Long getProductId();
        String getProductName();
        String getSlug();
        String getThumbnailUrl();
        Long getTotalQuantitySold();
        BigDecimal getTotalRevenue();
    }

    @Query(value = "SELECT " +
            "p.id AS productId, " +
            "p.name AS productName, " +
            "p.slug AS slug, " +
            "p.thumbnail_url AS thumbnailUrl, " +
            "COALESCE(SUM(oi.quantity), 0) AS totalQuantitySold, " +
            "COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) AS totalRevenue " +
            "FROM order_items oi " +
            "JOIN orders o ON oi.order_id = o.id " +
            "JOIN product_variations pv ON oi.variation_id = pv.id " +
            "JOIN product_colors pc ON pv.color_id = pc.id " +
            "JOIN products p ON pc.product_id = p.id " +
            "WHERE o.status = 'DELIVERED' " +
            "  AND o.created_at >= :from AND o.created_at < :to " +
            "GROUP BY p.id, p.name, p.slug, p.thumbnail_url " +
            "HAVING COALESCE(SUM(oi.quantity), 0) > 0 AND COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) > 0 " +
            "ORDER BY totalQuantitySold DESC, totalRevenue DESC " +
            "LIMIT :limit", nativeQuery = true)
    List<TopProductProjection> findTopSellingProductsBetween(
            @Param("from") OffsetDateTime from,
            @Param("to") OffsetDateTime to,
            @Param("limit") int limit);

    interface CategoryRevenueProjection {
        Long getCategoryId();
        String getCategoryName();
        BigDecimal getRevenue();
    }

    @Query(value = "SELECT " +
            "c.id AS categoryId, " +
            "c.name AS categoryName, " +
            "COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) AS revenue " +
            "FROM order_items oi " +
            "JOIN orders o ON oi.order_id = o.id " +
            "JOIN product_variations pv ON oi.variation_id = pv.id " +
            "JOIN product_colors pc ON pv.color_id = pc.id " +
            "JOIN products p ON pc.product_id = p.id " +
            "JOIN categories c ON p.category_id = c.id " +
            "WHERE o.status = 'DELIVERED' " +
            "  AND o.created_at >= :from AND o.created_at < :to " +
            "GROUP BY c.id, c.name " +
            "HAVING COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) > 0 " +
            "ORDER BY revenue DESC", nativeQuery = true)
    List<CategoryRevenueProjection> findCategoryRevenueBetween(
            @Param("from") OffsetDateTime from,
            @Param("to") OffsetDateTime to);
}
