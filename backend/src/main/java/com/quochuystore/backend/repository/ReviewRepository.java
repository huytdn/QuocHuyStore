package com.quochuystore.backend.repository;

import com.quochuystore.backend.dto.review.response.ReviewResponseDto;
import com.quochuystore.backend.entity.OrderItem;
import com.quochuystore.backend.entity.ProductReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<ProductReview, Long> {

    @Query("SELECT new com.quochuystore.backend.dto.review.response.ReviewResponseDto(" +
            "r.id, u.id, u.displayName, r.rating, r.variationName, r.content, r.imageUrl, r.createdAt) " +
            "FROM ProductReview r JOIN r.user u WHERE r.product.id = :productId")
    List<ReviewResponseDto> findByProductId(@Param("productId") Long productId, Pageable pageable);

    @Query(value = "SELECT new com.quochuystore.backend.dto.review.response.ReviewResponseDto(" +
            "r.id, u.id, u.displayName, r.rating, r.variationName, r.content, r.imageUrl, r.createdAt) " +
            "FROM ProductReview r JOIN r.user u WHERE r.product.id = :productId AND r.rating = :rating",
            countQuery = "SELECT COUNT(r) FROM ProductReview r WHERE r.product.id = :productId AND r.rating = :rating")
    Page<ReviewResponseDto> findByProductIdAndRating(@Param("productId") Long productId,
            @Param("rating") Integer rating, Pageable pageable);

    @Query("SELECT oi FROM OrderItem oi " +
            "JOIN FETCH oi.productVariation pv " +
            "JOIN FETCH pv.productColor pc " +
            "JOIN FETCH pc.product p " +
            "JOIN oi.order o " +
            "WHERE oi.id = :orderItemId AND o.user.id = :userId " +
            "AND o.status = com.quochuystore.backend.entity.enums.OrderStatus.DELIVERED")
    Optional<OrderItem> findEligibleOrderItem(@Param("orderItemId") UUID orderItemId, @Param("userId") UUID userId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query(value = "INSERT INTO product_reviews " +
            "(user_id, product_id, order_item_id, rating, variation_name, content, image_url, image_public_id) " +
            "VALUES (:userId, :productId, :orderItemId, :rating, :variationName, :content, :imageUrl, :imagePublicId) " +
            "ON CONFLICT (user_id, product_id) DO UPDATE SET " +
            "order_item_id = EXCLUDED.order_item_id, " +
            "rating = EXCLUDED.rating, " +
            "variation_name = EXCLUDED.variation_name, " +
            "content = EXCLUDED.content, " +
            "image_url = COALESCE(EXCLUDED.image_url, product_reviews.image_url), " +
            "image_public_id = COALESCE(EXCLUDED.image_public_id, product_reviews.image_public_id), " +
            "updated_at = NOW()", nativeQuery = true)
    int upsertReview(@Param("userId") UUID userId,
            @Param("productId") Long productId,
            @Param("orderItemId") UUID orderItemId,
            @Param("rating") Integer rating,
            @Param("variationName") String variationName,
            @Param("content") String content,
            @Param("imageUrl") String imageUrl,
            @Param("imagePublicId") String imagePublicId);

    @Query("SELECT r.imagePublicId FROM ProductReview r WHERE r.user.id = :userId AND r.product.id = :productId")
    Optional<String> findImagePublicId(@Param("userId") UUID userId, @Param("productId") Long productId);

    @Query("SELECT new com.quochuystore.backend.dto.review.response.ReviewResponseDto(" +
            "r.id, u.id, u.displayName, r.rating, r.variationName, r.content, r.imageUrl, r.createdAt) " +
            "FROM ProductReview r JOIN r.user u WHERE r.user.id = :userId AND r.product.id = :productId")
    Optional<ReviewResponseDto> findProjectionByUserIdAndProductId(@Param("userId") UUID userId,
            @Param("productId") Long productId);
}
