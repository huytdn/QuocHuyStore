package com.quochuystore.backend.repository;

import com.quochuystore.backend.entity.ProductVariation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductVariationRepository extends JpaRepository<ProductVariation, Long> {
    List<ProductVariation> findByProductColorIdAndIsActive(Long colorId, Boolean isActive);
    List<ProductVariation> findByProductColorIdInAndIsActive(List<Long> colorIds, Boolean isActive);
    List<ProductVariation> findByProductColorId(Long colorId);
    boolean existsByProductColorIdAndIsActive(Long colorId, Boolean isActive);
    boolean existsByProductColorIdAndSizeIgnoreCase(Long colorId, String size);
    boolean existsByProductColorIdAndSizeIgnoreCaseAndIdNot(Long colorId, String size, Long id);
}
