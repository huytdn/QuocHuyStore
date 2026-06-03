package com.quochuystore.backend.repository;

import com.quochuystore.backend.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {

    @Query("SELECT ci FROM CartItem ci " +
            "JOIN FETCH ci.productVariation pv " +
            "JOIN FETCH pv.productColor pc " +
            "JOIN FETCH pc.product p " +
            "WHERE ci.user.id = :userId")
    List<CartItem> findByUserIdWithDetails(@Param("userId") UUID userId);

    @Query("SELECT ci FROM CartItem ci " +
            "JOIN FETCH ci.productVariation pv " +
            "JOIN FETCH pv.productColor pc " +
            "JOIN FETCH pc.product p " +
            "WHERE ci.id = :id")
    Optional<CartItem> findByIdWithDetails(@Param("id") UUID id);

    @Query("SELECT ci FROM CartItem ci " +
            "JOIN FETCH ci.productVariation pv " +
            "JOIN FETCH pv.productColor pc " +
            "JOIN FETCH pc.product p " +
            "WHERE ci.user.id = :userId AND pv.id = :variationId")
    Optional<CartItem> findByUserIdAndProductVariationIdWithDetails(
            @Param("userId") UUID userId,
            @Param("variationId") Long variationId);

    Optional<CartItem> findByUserIdAndProductVariationId(UUID userId, Long variationId);

    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.user.id = :userId")
    void deleteByUserId(@Param("userId") UUID userId);
}
