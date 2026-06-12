package com.quochuystore.backend.service.impl;

import com.quochuystore.backend.dto.product.request.VariationRequestDto;
import com.quochuystore.backend.dto.product.request.VariationStockUpdateRequestDto;
import com.quochuystore.backend.dto.product.response.ProductVariationResponseDto;
import com.quochuystore.backend.dto.mapper.ProductMapper;
import com.quochuystore.backend.config.CacheKeyConstants;
import com.quochuystore.backend.entity.ProductColor;
import com.quochuystore.backend.entity.ProductVariation;
import com.quochuystore.backend.exception.BadRequestException;
import com.quochuystore.backend.exception.ResourceNotFoundException;
import com.quochuystore.backend.repository.ProductColorRepository;
import com.quochuystore.backend.repository.ProductVariationRepository;
import com.quochuystore.backend.service.ProductVariationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductVariationServiceImpl implements ProductVariationService {

    private final ProductVariationRepository productVariationRepository;
    private final ProductColorRepository productColorRepository;
    private final StringRedisTemplate redisTemplate;

    @Override
    @Transactional
    public ProductVariationResponseDto createVariation(Long colorId, VariationRequestDto request) {
        log.info("Creating variation for color id: {}, size: {}", colorId, request.getSize());

        ProductColor color = productColorRepository.findById(colorId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductColor not found with id: " + colorId));

        if (productVariationRepository.existsByProductColorIdAndSizeIgnoreCase(colorId, request.getSize().trim())) {
            log.warn("Variation creation failed: Size '{}' already exists for color {}", request.getSize(), colorId);
            throw new BadRequestException("Size already exists for this color");
        }

        ProductVariation variation = ProductVariation.builder()
                .productColor(color)
                .size(request.getSize().trim())
                .unitPrice(request.getUnitPrice())
                .stockQuantity(request.getStockQuantity())
                .isActive(true)
                .build();

        ProductVariation savedVariation = productVariationRepository.save(variation);
        log.info("Successfully created variation with id: {}", savedVariation.getId());

        // Evict product cache
        String productSlug = productColorRepository.findProductSlugByColorId(colorId);
        evictProductCache(productSlug);

        return ProductMapper.toProductVariationResponseDto(savedVariation);
    }

    @Override
    @Transactional
    public ProductVariationResponseDto updateVariation(Long id, VariationRequestDto request) {
        log.info("Updating variation id: {}", id);

        ProductVariation variation = productVariationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariation not found with id: " + id));

        ProductColor color = variation.getProductColor();

        if (productVariationRepository.existsByProductColorIdAndSizeIgnoreCaseAndIdNot(color.getId(),
                request.getSize().trim(), id)) {
            log.warn("Variation update failed: Size '{}' already exists on another variation for color {}",
                    request.getSize(), color.getId());
            throw new BadRequestException("Size already exists for this color");
        }

        variation.setSize(request.getSize().trim());
        variation.setUnitPrice(request.getUnitPrice());
        variation.setStockQuantity(request.getStockQuantity());

        ProductVariation updatedVariation = productVariationRepository.save(variation);
        log.info("Successfully updated variation with id: {}", updatedVariation.getId());

        // Evict product cache
        String productSlug = productVariationRepository.findProductSlugByVariationId(id);
        evictProductCache(productSlug);

        return ProductMapper.toProductVariationResponseDto(updatedVariation);
    }

    @Override
    @Transactional
    public ProductVariationResponseDto updateStock(Long id, VariationStockUpdateRequestDto request) {
        log.info("Patching variation id: {} stock quantity to: {}", id, request.getStockQuantity());

        ProductVariation variation = productVariationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariation not found with id: " + id));

        variation.setStockQuantity(request.getStockQuantity());
        ProductVariation updatedVariation = productVariationRepository.save(variation);
        log.info("Successfully updated stock quantity for variation with id: {}", updatedVariation.getId());

        // Evict product cache
        String productSlug = productVariationRepository.findProductSlugByVariationId(id);
        evictProductCache(productSlug);

        return ProductMapper.toProductVariationResponseDto(updatedVariation);
    }

    @Override
    @Transactional
    public void deleteVariation(Long id) {
        log.info("Soft deleting variation id: {}", id);

        ProductVariation variation = productVariationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariation not found with id: " + id));

        if (variation.getStockQuantity() == null || variation.getStockQuantity() != 0) {
            log.warn("Cannot delete variation id: {} because stock quantity is not 0", id);
            throw new BadRequestException("Cannot delete variation. Stock quantity must be 0");
        }

        variation.setIsActive(false);
        productVariationRepository.save(variation);
        log.info("Successfully soft deleted variation with id: {}", id);

        // Evict product cache
        String productSlug = productVariationRepository.findProductSlugByVariationId(id);
        evictProductCache(productSlug);
    }

    private void evictProductCache(String slug) {
        String cacheKey = CacheKeyConstants.PRODUCT_SLUG_PREFIX + slug;
        try {
            Boolean deleted = redisTemplate.delete(cacheKey);
            if (Boolean.TRUE.equals(deleted)) {
                log.info("Evicted product cache key: {} due to variation modification", cacheKey);
            }
        } catch (Exception e) {
            log.error("Failed to evict product cache key: {}", cacheKey, e);
        }
    }

}
