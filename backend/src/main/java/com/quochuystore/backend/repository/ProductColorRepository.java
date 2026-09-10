package com.quochuystore.backend.repository;

import com.quochuystore.backend.entity.ProductColor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductColorRepository extends JpaRepository<ProductColor, Long> {
    List<ProductColor> findByProductIdAndIsActive(Long productId, Boolean isActive);

    List<ProductColor> findByProductId(Long productId);

    boolean existsByProductIdAndIsActive(Long productId, Boolean isActive);

    boolean existsByProductIdAndColorNameIgnoreCase(Long productId, String colorName);

    boolean existsByProductIdAndColorNameIgnoreCaseAndIdNot(Long productId, String colorName, Long id);

    @Query("SELECT c.product.slug FROM ProductColor c WHERE c.id = :colorId")
    String findProductSlugByColorId(@Param("colorId") Long colorId);

    /**
     * image_embedding is a pgvector column, deliberately unmapped on the ProductColor
     * entity — all reads/writes go through native queries like this one.
     */
    @Modifying
    @Query(value = "UPDATE product_colors SET image_embedding = CAST(:vec AS vector) WHERE id = :id", nativeQuery = true)
    int updateImageEmbedding(@Param("id") Long id, @Param("vec") String vec);

    @Query(value = "SELECT id AS \"id\", image_url AS \"imageUrl\" FROM product_colors "
            + "WHERE is_active = TRUE AND image_embedding IS NULL ORDER BY id LIMIT :batchSize", nativeQuery = true)
    List<ColorMissingEmbeddingProjection> findColorsMissingEmbedding(@Param("batchSize") int batchSize);

    @Query(value = "SELECT COUNT(*) FROM product_colors WHERE is_active = TRUE AND image_embedding IS NULL",
            nativeQuery = true)
    long countColorsMissingEmbedding();

    interface ColorMissingEmbeddingProjection {
        Long getId();

        String getImageUrl();
    }

    /**
     * Best-matching color per product, ranked by cosine distance. DISTINCT ON picks the
     * nearest color for each product so one product's colorways can't fill every result
     * slot; the outer query then globally re-sorts, thresholds, and limits. Aliases are
     * double-quoted to preserve camelCase for the projection getters below — Postgres
     * folds unquoted identifiers to lowercase. No HNSW/IVFFlat index is used by this
     * shape of query (DISTINCT ON forces a full scan regardless), which is fine at
     * catalog scale; revisit past roughly 50k product_colors rows.
     */
    @Query(value = "SELECT * FROM ( "
            + "SELECT DISTINCT ON (p.id) "
            + "p.id AS \"productId\", pc.id AS \"colorId\", pc.color_name AS \"colorName\", "
            + "pc.image_url AS \"colorImageUrl\", p.name AS \"name\", p.slug AS \"slug\", "
            + "p.thumbnail_url AS \"thumbnailUrl\", p.thumbnail_public_id AS \"thumbnailPublicId\", "
            + "CAST(p.min_price AS NUMERIC) AS \"minPrice\", c.name AS \"categoryName\", "
            + "CAST(p.average_star AS NUMERIC) AS \"averageStar\", CAST(p.review_count AS INTEGER) AS \"reviewCount\", "
            + "CAST(pc.image_embedding <=> CAST(:vec AS vector) AS DOUBLE PRECISION) AS distance "
            + "FROM product_colors pc "
            + "JOIN products p ON p.id = pc.product_id "
            + "LEFT JOIN categories c ON c.id = p.category_id "
            + "WHERE pc.image_embedding IS NOT NULL AND pc.is_active = TRUE AND p.is_active = TRUE "
            + "ORDER BY p.id, distance "
            + ") t "
            + "WHERE t.distance <= :maxDistance "
            + "ORDER BY t.distance "
            + "LIMIT :topK",
            nativeQuery = true)
    List<ImageSearchProjection> searchByEmbedding(@Param("vec") String vec, @Param("maxDistance") double maxDistance,
            @Param("topK") int topK);

    interface ImageSearchProjection {
        Long getProductId();

        Long getColorId();

        String getColorName();

        String getColorImageUrl();

        String getName();

        String getSlug();

        String getThumbnailUrl();

        String getThumbnailPublicId();

        BigDecimal getMinPrice();

        String getCategoryName();

        BigDecimal getAverageStar();

        Integer getReviewCount();

        Double getDistance();
    }
}
