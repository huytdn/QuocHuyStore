package com.quochuystore.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "product_reviews",
        uniqueConstraints = {
                @UniqueConstraint(name = "unique_user_product_review", columnNames = { "user_id", "product_id" }),
                @UniqueConstraint(name = "uq_product_reviews_order_item", columnNames = { "order_item_id" })
        },
        indexes = {
                @Index(name = "idx_product_reviews_product_created", columnList = "product_id, created_at DESC, id DESC"),
                @Index(name = "idx_product_reviews_product_rating_created", columnList = "product_id, rating, created_at DESC, id DESC"),
                @Index(name = "idx_product_reviews_created_at", columnList = "created_at DESC, id DESC"),
                @Index(name = "idx_product_reviews_rating_created", columnList = "rating, created_at DESC, id DESC")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id", nullable = false)
    private OrderItem orderItem;

    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Column(name = "variation_name", nullable = false, length = 100)
    private String variationName;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "image_public_id", columnDefinition = "TEXT")
    private String imagePublicId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
