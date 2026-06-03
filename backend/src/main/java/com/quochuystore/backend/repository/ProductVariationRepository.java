package com.quochuystore.backend.repository;

import com.quochuystore.backend.entity.ProductVariation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
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

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT pv FROM ProductVariation pv " +
            "JOIN FETCH pv.productColor pc " +
            "JOIN FETCH pc.product p " +
            "WHERE pv.id IN :ids")
    List<ProductVariation> findAllByIdsWithDetails(@Param("ids") java.util.Collection<Long> ids);
}
