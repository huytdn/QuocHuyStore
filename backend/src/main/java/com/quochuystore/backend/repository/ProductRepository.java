package com.quochuystore.backend.repository;

import com.quochuystore.backend.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsByCategoryIdAndIsActive(Long categoryId, Boolean isActive);

    boolean existsBySlugIgnoreCase(String slug);

    boolean existsBySlugIgnoreCaseAndIdNot(String slug, Long id);

    @Override
    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category WHERE p.id = :id")
    Optional<Product> findById(@Param("id") Long id);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category WHERE p.slug = :slug AND p.isActive = :isActive")
    Optional<Product> findBySlugAndIsActive(@Param("slug") String slug, @Param("isActive") Boolean isActive);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category WHERE p.slug = :slug")
    Optional<Product> findBySlug(@Param("slug") String slug);

    @Query(value = "SELECT p FROM Product p LEFT JOIN FETCH p.category WHERE " +
            "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
            "(CAST(:search AS string) IS NULL OR LOWER(p.name) LIKE CONCAT('%', LOWER(CAST(:search AS string)), '%')) AND " +
            "(:minPrice IS NULL OR p.minPrice >= :minPrice) AND " +
            "(:maxPrice IS NULL OR p.minPrice <= :maxPrice) AND " +
            "(p.isActive = true)", countQuery = "SELECT COUNT(p) FROM Product p LEFT JOIN p.category WHERE " +
            "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
            "(CAST(:search AS string) IS NULL OR LOWER(p.name) LIKE CONCAT('%', LOWER(CAST(:search AS string)), '%')) AND " +
            "(:minPrice IS NULL OR p.minPrice >= :minPrice) AND " +
            "(:maxPrice IS NULL OR p.minPrice <= :maxPrice) AND " +
            "(p.isActive = true)")

    Page<Product> findActiveProductsWithFilters(
            @Param("categoryId") Long categoryId,
            @Param("search") String search,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable);
}
