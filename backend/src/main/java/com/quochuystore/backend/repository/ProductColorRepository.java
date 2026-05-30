package com.quochuystore.backend.repository;

import com.quochuystore.backend.entity.ProductColor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductColorRepository extends JpaRepository<ProductColor, Long> {
    List<ProductColor> findByProductIdAndIsActive(Long productId, Boolean isActive);
    List<ProductColor> findByProductId(Long productId);
    boolean existsByProductIdAndIsActive(Long productId, Boolean isActive);
    boolean existsByProductIdAndColorNameIgnoreCase(Long productId, String colorName);
    boolean existsByProductIdAndColorNameIgnoreCaseAndIdNot(Long productId, String colorName, Long id);
}
