package com.quochuystore.backend.repository;

import com.quochuystore.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsByCategoryIdAndIsActive(Long categoryId, Boolean isActive);
}
