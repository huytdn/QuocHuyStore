package com.quochuystore.backend.repository;

import com.quochuystore.backend.entity.ProductVariation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariationRepository extends JpaRepository<ProductVariation, Long> {
    List<ProductVariation> findByProductColorIdAndIsActive(Long colorId, Boolean isActive);

    List<ProductVariation> findByProductColorIdInAndIsActive(List<Long> colorIds, Boolean isActive);

    List<ProductVariation> findByProductColorId(Long colorId);

    boolean existsByProductColorIdAndIsActive(Long colorId, Boolean isActive);

    boolean existsByProductColorIdAndSizeIgnoreCase(Long colorId, String size);

    boolean existsByProductColorIdAndSizeIgnoreCaseAndIdNot(Long colorId, String size, Long id);

    @Query("SELECT pv FROM ProductVariation pv " +
            "JOIN FETCH pv.productColor pc " +
            "JOIN FETCH pc.product p " +
            "WHERE pv.id = :id")
    Optional<ProductVariation> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT pv FROM ProductVariation pv " +
            "JOIN FETCH pv.productColor pc " +
            "JOIN FETCH pc.product p " +
            "WHERE pv.id IN :ids")
    List<ProductVariation> findAllByIdsWithDetails(@Param("ids") java.util.Collection<Long> ids);

    /**
     * Atomic stock deduction. Returns 1 if successful, 0 if insufficient stock.
     * Uses DB-level arithmetic to avoid race conditions — no application-side read required.
     */
    @Modifying
    @Query("UPDATE ProductVariation pv SET pv.stockQuantity = pv.stockQuantity - :qty " +
            "WHERE pv.id = :id AND pv.stockQuantity >= :qty")
    int deductStock(@Param("id") Long id, @Param("qty") Integer qty);

    /**
     * Atomic stock restoration. Always succeeds — adding back is unconditional.
     * Used when an order is canceled or payment fails.
     */
    @Modifying
    @Query("UPDATE ProductVariation pv SET pv.stockQuantity = pv.stockQuantity + :qty " +
            "WHERE pv.id = :id")
    int restoreStock(@Param("id") Long id, @Param("qty") Integer qty);
}
