package com.quochuystore.backend.repository;

import com.quochuystore.backend.entity.Like;
import com.quochuystore.backend.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {

    boolean existsByUserIdAndProductId(UUID userId, Long productId);

    Optional<Like> findByUserIdAndProductId(UUID userId, Long productId);

    @Modifying
    @Query("DELETE FROM Like l WHERE l.user.id = :userId AND l.product.id = :productId")
    void deleteByUserIdAndProductId(@Param("userId") UUID userId, @Param("productId") Long productId);

    @Query("SELECT l.product.id FROM Like l WHERE l.user.id = :userId")
    Set<Long> findProductIdsByUserId(@Param("userId") UUID userId);

    @Query("SELECT l.product.id FROM Like l WHERE l.user.id = :userId AND l.product.id IN :productIds")
    Set<Long> findLikedProductIdsByUserIdAndProductIds(
            @Param("userId") UUID userId,
            @Param("productIds") Collection<Long> productIds);

    @Query(value = "SELECT l.product FROM Like l LEFT JOIN FETCH l.product.category WHERE l.user.id = :userId AND l.product.isActive = true ORDER BY l.createdAt DESC",
           countQuery = "SELECT COUNT(l) FROM Like l WHERE l.user.id = :userId AND l.product.isActive = true")
    Page<Product> findLikedProductsByUserId(@Param("userId") UUID userId, Pageable pageable);

    long countByProductId(Long productId);
}
