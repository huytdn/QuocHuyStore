package com.quochuystore.backend.dto.mapper;

import com.quochuystore.backend.dto.product.response.CategoryResponseDto;
import com.quochuystore.backend.dto.product.response.ProductColorResponseDto;
import com.quochuystore.backend.dto.product.response.ProductDetailResponseDto;
import com.quochuystore.backend.dto.product.response.ProductListResponseDto;
import com.quochuystore.backend.dto.product.response.ProductVariationResponseDto;
import com.quochuystore.backend.entity.Category;
import com.quochuystore.backend.entity.Product;
import com.quochuystore.backend.entity.ProductColor;
import com.quochuystore.backend.entity.ProductVariation;

import java.util.List;
import java.util.Map;

public final class ProductMapper {
    private ProductMapper() {}

    public static ProductVariationResponseDto toProductVariationResponseDto(ProductVariation variation) {
        return ProductVariationResponseDto.builder()
                .variationId(variation.getId())
                .size(variation.getSize())
                .unitPrice(variation.getUnitPrice())
                .stockQuantity(variation.getStockQuantity())
                .isActive(variation.getIsActive())
                .build();
    }

    public static ProductColorResponseDto toProductColorResponseDto(ProductColor color, List<ProductVariationResponseDto> variations) {
        return ProductColorResponseDto.builder()
                .colorId(color.getId())
                .colorName(color.getColorName())
                .imageUrl(color.getImageUrl())
                .imagePublicId(color.getImagePublicId())
                .variations(variations)
                .build();
    }

    public static ProductListResponseDto toProductListResponseDto(Product product) {
        return ProductListResponseDto.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .thumbnailUrl(product.getThumbnailUrl())
                .thumbnailPublicId(product.getThumbnailPublicId())
                .minPrice(product.getMinPrice())
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .averageStar(product.getAverageStar() != null ? product.getAverageStar().doubleValue() : 0.0)
                .reviewCount(product.getReviewCount())
                .build();
    }

    public static ProductDetailResponseDto toProductDetailResponseDto(Product product, List<ProductColorResponseDto> colors) {
        return ProductDetailResponseDto.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .thumbnailUrl(product.getThumbnailUrl())
                .thumbnailPublicId(product.getThumbnailPublicId())
                .description(product.getDescription())
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .averageStar(product.getAverageStar() != null ? product.getAverageStar().doubleValue() : 0.0)
                .reviewCount(product.getReviewCount())
                .feedbackCount(product.getFeedbackCount())
                .colors(colors)
                .build();
    }

    public static CategoryResponseDto toCategoryResponseDto(Category category) {
        return CategoryResponseDto.builder()
                .id(category.getId())
                .name(category.getName())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}
