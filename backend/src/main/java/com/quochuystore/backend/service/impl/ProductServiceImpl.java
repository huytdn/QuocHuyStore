package com.quochuystore.backend.service.impl;

import tools.jackson.databind.ObjectMapper;
import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.product.request.ProductCreateRequestDto;
import com.quochuystore.backend.dto.product.request.ProductUpdateRequestDto;
import com.quochuystore.backend.dto.product.response.ProductColorResponseDto;
import com.quochuystore.backend.dto.product.response.ProductDetailResponseDto;
import com.quochuystore.backend.dto.product.response.ProductListResponseDto;
import com.quochuystore.backend.dto.product.response.ProductVariationResponseDto;
import com.quochuystore.backend.entity.Category;
import com.quochuystore.backend.entity.Product;
import com.quochuystore.backend.entity.ProductColor;
import com.quochuystore.backend.entity.ProductVariation;
import com.quochuystore.backend.exception.BadRequestException;
import com.quochuystore.backend.exception.ResourceNotFoundException;
import com.quochuystore.backend.repository.CategoryRepository;
import com.quochuystore.backend.repository.ProductColorRepository;
import com.quochuystore.backend.repository.ProductRepository;
import com.quochuystore.backend.repository.ProductVariationRepository;
import com.quochuystore.backend.service.base.ImageService;
import com.quochuystore.backend.service.base.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductColorRepository productColorRepository;
    private final ProductVariationRepository productVariationRepository;
    private final ImageService imageService;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String CACHE_KEY_PREFIX = "qhs:products:slug:";
    private static final long CACHE_TTL_MINUTES = 120;

    @Override
    @Transactional(readOnly = true)
    public PageResponseDto<ProductListResponseDto> getProducts(
            Long categoryId,
            String search,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Pageable pageable) {
        log.info("Fetching products list - categoryId: {}, search: {}, minPrice: {}, maxPrice: {}, pageable: {}",
                categoryId, search, minPrice, maxPrice, pageable);

        Page<Product> productPage = productRepository.findActiveProductsWithFilters(
                categoryId, search, minPrice, maxPrice, pageable);

        List<ProductListResponseDto> content = productPage.getContent().stream()
                .map(this::mapToProductListResponseDto)
                .toList();

        return PageResponseDto.<ProductListResponseDto>builder()
                .content(content)
                .pageNo(productPage.getNumber())
                .pageSize(productPage.getSize())
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .last(productPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDetailResponseDto getProductBySlug(String slug) {
        log.info("Fetching product detail by slug: {}", slug);
        String cacheKey = CACHE_KEY_PREFIX + slug;

        // 1. Try Cache
        try {
            String cachedJson = redisTemplate.opsForValue().get(cacheKey);
            if (cachedJson != null) {
                log.info("Cache Hit for product slug: {}", slug);
                return objectMapper.readValue(cachedJson, ProductDetailResponseDto.class);
            }
        } catch (Exception e) {
            log.error("Failed to read product slug: {} from cache", slug, e);
        }

        // 2. Cache Miss
        log.info("Cache Miss for product slug: {}. Loading from database.", slug);
        Product product = productRepository.findBySlugAndIsActive(slug, true)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with slug: " + slug));

        ProductDetailResponseDto responseDto = mapToProductDetailResponseDto(product);

        // 3. Write Cache
        try {
            String json = objectMapper.writeValueAsString(responseDto);
            redisTemplate.opsForValue().set(cacheKey, json, CACHE_TTL_MINUTES, TimeUnit.MINUTES);
            log.info("Successfully cached product slug: {} with TTL of {} minutes", slug, CACHE_TTL_MINUTES);
        } catch (Exception e) {
            log.error("Failed to write product slug: {} to cache", slug, e);
        }

        return responseDto;
    }

    @Override
    @Transactional
    public ProductDetailResponseDto createProduct(ProductCreateRequestDto request, MultipartFile file) {
        log.info("Creating product with name: {}, slug: {}", request.getName(), request.getSlug());

        if (productRepository.existsBySlugIgnoreCase(request.getSlug().trim())) {
            log.warn("Product creation failed: Slug '{}' already exists", request.getSlug());
            throw new BadRequestException("Product slug already exists");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        // Upload Thumbnail to Cloudinary
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Thumbnail file is required for new product");
        }
        Map<String, String> uploadResult = imageService.uploadImage(file);

        Product product = Product.builder()
                .category(category)
                .name(request.getName().trim())
                .slug(request.getSlug().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .thumbnailUrl(uploadResult.get("url"))
                .thumbnailPublicId(uploadResult.get("public_id"))
                .build();

        Product savedProduct = productRepository.save(product);
        log.info("Successfully created product with id: {}", savedProduct.getId());

        return mapToProductDetailResponseDto(savedProduct);
    }

    @Override
    @Transactional
    public ProductDetailResponseDto updateProduct(Long id, ProductUpdateRequestDto request, MultipartFile file) {
        log.info("Updating product id: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (productRepository.existsBySlugIgnoreCaseAndIdNot(request.getSlug().trim(), id)) {
            log.warn("Product update failed: Slug '{}' already exists on another product", request.getSlug());
            throw new BadRequestException("Product slug already exists");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        String oldSlug = product.getSlug();

        // Optional Thumbnail Upload
        if (file != null && !file.isEmpty()) {
            String oldPublicId = product.getThumbnailPublicId();
            Map<String, String> uploadResult = imageService.uploadImage(file);
            product.setThumbnailUrl(uploadResult.get("url"));
            product.setThumbnailPublicId(uploadResult.get("public_id"));

            // Delete old image asynchronously or directly
            if (oldPublicId != null && !oldPublicId.isBlank()) {
                imageService.deleteImage(oldPublicId);
            }
        }

        product.setCategory(category);
        product.setName(request.getName().trim());
        product.setSlug(request.getSlug().trim());
        product.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);

        Product updatedProduct = productRepository.save(product);
        log.info("Successfully updated product with id: {}", updatedProduct.getId());

        // Evict Cache
        evictCache(oldSlug);
        evictCache(updatedProduct.getSlug());

        return mapToProductDetailResponseDto(updatedProduct);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        log.info("Soft deleting product id: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        // Check if there are active colors under this product
        boolean hasActiveColors = productColorRepository.existsByProductIdAndIsActive(id, true);
        if (hasActiveColors) {
            log.warn("Product deletion failed: Product id: {} has active colors", id);
            throw new BadRequestException("Cannot delete product because it contains active colors");
        }

        product.setIsActive(false);
        productRepository.save(product);
        log.info("Successfully soft deleted product with id: {}", id);

        // Evict Cache
        evictCache(product.getSlug());
    }

    private void evictCache(String slug) {
        String cacheKey = CACHE_KEY_PREFIX + slug;
        try {
            Boolean deleted = redisTemplate.delete(cacheKey);
            if (Boolean.TRUE.equals(deleted)) {
                log.info("Successfully evicted product cache key: {}", cacheKey);
            }
        } catch (Exception e) {
            log.error("Failed to evict product cache key: {}", cacheKey, e);
        }
    }

    private ProductListResponseDto mapToProductListResponseDto(Product product) {
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

    private ProductDetailResponseDto mapToProductDetailResponseDto(Product product) {
        // Fetch active colors
        List<ProductColor> colors = productColorRepository.findByProductIdAndIsActive(product.getId(), true);
        List<Long> colorIds = colors.stream().map(ProductColor::getId).toList();
        List<ProductVariation> allVariations = colorIds.isEmpty() ? List.of() :
                productVariationRepository.findByProductColorIdInAndIsActive(colorIds, true);

        Map<Long, List<ProductVariation>> variationsByColorId = allVariations.stream()
                .collect(java.util.stream.Collectors.groupingBy(v -> v.getProductColor().getId()));

        List<ProductColorResponseDto> colorResponseDtos = colors.stream()
                .map(color -> {
                    List<ProductVariation> variations = variationsByColorId.getOrDefault(color.getId(), List.of());
                    List<ProductVariationResponseDto> variationResponseDtos = variations.stream()
                            .map(this::mapToProductVariationResponseDto)
                            .toList();
                    return ProductColorResponseDto.builder()
                            .colorId(color.getId())
                            .colorName(color.getColorName())
                            .imageUrl(color.getImageUrl())
                            .imagePublicId(color.getImagePublicId())
                            .variations(variationResponseDtos)
                            .build();
                })
                .toList();

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
                .colors(colorResponseDtos)
                .build();
    }

    private ProductVariationResponseDto mapToProductVariationResponseDto(ProductVariation variation) {
        return ProductVariationResponseDto.builder()
                .variationId(variation.getId())
                .size(variation.getSize())
                .unitPrice(variation.getUnitPrice())
                .stockQuantity(variation.getStockQuantity())
                .isActive(variation.getIsActive())
                .build();
    }
}
