package com.quochuystore.backend.service.impl;

import com.quochuystore.backend.dto.product.response.ProductColorResponseDto;
import com.quochuystore.backend.dto.product.response.ProductVariationResponseDto;
import com.quochuystore.backend.entity.Product;
import com.quochuystore.backend.entity.ProductColor;
import com.quochuystore.backend.entity.ProductVariation;
import com.quochuystore.backend.config.CacheKeyConstants;
import com.quochuystore.backend.dto.mapper.ProductMapper;
import com.quochuystore.backend.exception.BadRequestException;
import com.quochuystore.backend.exception.ResourceNotFoundException;
import com.quochuystore.backend.repository.ProductColorRepository;
import com.quochuystore.backend.repository.ProductRepository;
import com.quochuystore.backend.repository.ProductVariationRepository;
import com.quochuystore.backend.service.ImageService;
import com.quochuystore.backend.service.ProductColorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductColorServiceImpl implements ProductColorService {

    private final ProductColorRepository productColorRepository;
    private final ProductRepository productRepository;
    private final ProductVariationRepository productVariationRepository;
    private final ImageService imageService;
    private final StringRedisTemplate redisTemplate;

    @Override
    @Transactional
    public ProductColorResponseDto createColor(Long productId, String colorName, MultipartFile file) {
        log.info("Creating color for product id: {}, colorName: {}", productId, colorName);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (productColorRepository.existsByProductIdAndColorNameIgnoreCase(productId, colorName.trim())) {
            log.warn("Color creation failed: Name '{}' already exists for product {}", colorName, productId);
            throw new BadRequestException("Color name already exists for this product");
        }

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Image file is required for product color");
        }

        Map<String, String> uploadResult = imageService.uploadImage(file);

        ProductColor color = ProductColor.builder()
                .product(product)
                .colorName(colorName.trim())
                .imageUrl(uploadResult.get("url"))
                .imagePublicId(uploadResult.get("public_id"))
                .isActive(true)
                .build();

        ProductColor savedColor = productColorRepository.save(color);
        log.info("Successfully created color with id: {}", savedColor.getId());

        // Evict product cache
        evictProductCache(product.getSlug());

        return getProductColorResponseDto(savedColor);
    }

    @Override
    @Transactional
    public ProductColorResponseDto updateColor(Long id, String colorName, MultipartFile file) {
        log.info("Updating color id: {}, colorName: {}", id, colorName);

        ProductColor color = productColorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Color not found with id: " + id));

        Product product = color.getProduct();

        if (productColorRepository.existsByProductIdAndColorNameIgnoreCaseAndIdNot(product.getId(), colorName.trim(),
                id)) {
            log.warn("Color update failed: Name '{}' already exists on another color for product {}", colorName,
                    product.getId());
            throw new BadRequestException("Color name already exists for this product");
        }

        if (file != null && !file.isEmpty()) {
            String oldPublicId = color.getImagePublicId();
            Map<String, String> uploadResult = imageService.uploadImage(file);
            color.setImageUrl(uploadResult.get("url"));
            color.setImagePublicId(uploadResult.get("public_id"));

            if (oldPublicId != null && !oldPublicId.isBlank()) {
                imageService.deleteImage(oldPublicId);
            }
        }

        color.setColorName(colorName.trim());
        ProductColor updatedColor = productColorRepository.save(color);
        log.info("Successfully updated color with id: {}", updatedColor.getId());

        // Evict product cache
        evictProductCache(product.getSlug());

        return getProductColorResponseDto(updatedColor);
    }

    @Override
    @Transactional
    public void deleteColor(Long id) {
        log.info("Soft deleting color id: {}", id);

        ProductColor color = productColorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Color not found with id: " + id));

        // Check if there are active variations under this color
        boolean hasActiveVariations = productVariationRepository.existsByProductColorIdAndIsActive(id, true);
        if (hasActiveVariations) {
            log.warn("Color deletion failed: Color id: {} has active variations", id);
            throw new BadRequestException("Cannot delete color because it contains active variations");
        }

        color.setIsActive(false);
        productColorRepository.save(color);
        log.info("Successfully soft deleted color with id: {}", id);

        // Evict product cache
        evictProductCache(color.getProduct().getSlug());
    }

    private void evictProductCache(String slug) {
        String cacheKey = CacheKeyConstants.PRODUCT_SLUG_PREFIX + slug;
        try {
            Boolean deleted = redisTemplate.delete(cacheKey);
            if (Boolean.TRUE.equals(deleted)) {
                log.info("Evicted product cache key: {} due to color modification", cacheKey);
            }
        } catch (Exception e) {
            log.error("Failed to evict product cache key: {}", cacheKey, e);
        }
    }

    private ProductColorResponseDto getProductColorResponseDto(ProductColor color) {
        List<ProductVariation> variations = productVariationRepository.findByProductColorIdAndIsActive(color.getId(),
                true);
        List<ProductVariationResponseDto> variationResponseDtos = variations.stream()
                .map(ProductMapper::toProductVariationResponseDto)
                .toList();

        return ProductMapper.toProductColorResponseDto(color, variationResponseDtos);
    }
}
