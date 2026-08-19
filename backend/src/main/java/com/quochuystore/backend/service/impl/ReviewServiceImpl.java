package com.quochuystore.backend.service.impl;

import com.quochuystore.backend.config.CacheKeyConstants;
import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.review.request.ReviewCreateRequestDto;
import com.quochuystore.backend.dto.review.response.ReviewResponseDto;
import com.quochuystore.backend.entity.OrderItem;
import com.quochuystore.backend.entity.Product;
import com.quochuystore.backend.exception.BadRequestException;
import com.quochuystore.backend.exception.ResourceNotFoundException;
import com.quochuystore.backend.repository.ProductRepository;
import com.quochuystore.backend.repository.ReviewRepository;
import com.quochuystore.backend.service.ImageService;
import com.quochuystore.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewServiceImpl implements ReviewService {

    private static final int MAX_PAGE_SIZE = 50;
    private static final long MAX_IMAGE_SIZE_BYTES = 5L * 1024 * 1024;
    private static final int VARIATION_NAME_MAX_LENGTH = 100;

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final ImageService imageService;
    private final StringRedisTemplate redisTemplate;

    @Override
    public PageResponseDto<ReviewResponseDto> getProductReviews(String slug, Integer rating, int page, int size) {
        if (rating != null && (rating < 1 || rating > 5)) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }

        int pageSize = Math.min(size, MAX_PAGE_SIZE);

        Product product = productRepository.findBySlugAndIsActive(slug, true)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with slug: " + slug));

        Pageable pageable = PageRequest.of(page, pageSize,
                Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id")));

        if (rating == null) {
            List<ReviewResponseDto> content = reviewRepository.findByProductId(product.getId(), pageable);
            long totalElements = product.getReviewCount() == null ? 0 : product.getReviewCount();
            int totalPages = totalElements == 0 ? 0 : (int) Math.ceil((double) totalElements / pageSize);

            return PageResponseDto.<ReviewResponseDto>builder()
                    .content(content)
                    .pageNo(page)
                    .pageSize(pageSize)
                    .totalElements(totalElements)
                    .totalPages(totalPages)
                    .last((page + 1) >= totalPages)
                    .build();
        }

        Page<ReviewResponseDto> resultPage = reviewRepository.findByProductIdAndRating(product.getId(), rating, pageable);

        return PageResponseDto.<ReviewResponseDto>builder()
                .content(resultPage.getContent())
                .pageNo(resultPage.getNumber())
                .pageSize(resultPage.getSize())
                .totalElements(resultPage.getTotalElements())
                .totalPages(resultPage.getTotalPages())
                .last(resultPage.isLast())
                .build();
    }

    @Override
    public ReviewResponseDto upsertReview(UUID userId, ReviewCreateRequestDto request, MultipartFile file) {
        validateFile(file);

        OrderItem orderItem = reviewRepository.findEligibleOrderItem(request.getOrderItemId(), userId)
                .orElseThrow(() -> new BadRequestException("Order item not found, not delivered, or not yours"));

        Long productId = orderItem.getProductVariation().getProductColor().getProduct().getId();
        String variationName = buildVariationName(orderItem.getColorName(), orderItem.getSizeName());

        String oldPublicId = reviewRepository.findImagePublicId(userId, productId).orElse(null);

        String imageUrl = null;
        String imagePublicId = null;
        if (file != null && !file.isEmpty()) {
            Map<String, String> uploadResult = imageService.uploadImage(file);
            imageUrl = uploadResult.get("url");
            imagePublicId = uploadResult.get("public_id");
        }

        try {
            reviewRepository.upsertReview(userId, productId, orderItem.getId(), request.getRating(),
                    variationName, request.getContent(), imageUrl, imagePublicId);
        } catch (RuntimeException e) {
            log.error("Failed to upsert review for userId {} productId {}", userId, productId, e);
            if (imagePublicId != null) {
                imageService.deleteImage(imagePublicId);
            }
            throw e;
        }

        ReviewResponseDto result = reviewRepository.findProjectionByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new IllegalStateException("Review not found immediately after upsert"));

        productRepository.findSlugById(productId).ifPresent(this::evictCache);

        if (imagePublicId != null && !imagePublicId.equals(oldPublicId) && oldPublicId != null) {
            imageService.deleteImage(oldPublicId);
        }

        return result;
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return;
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Only image files are supported");
        }

        if (file.getSize() > MAX_IMAGE_SIZE_BYTES) {
            throw new BadRequestException("Image file size exceeds maximum limit of 5MB");
        }
    }

    private String buildVariationName(String colorName, String sizeName) {
        String variationName = colorName + " / " + sizeName;
        return variationName.length() > VARIATION_NAME_MAX_LENGTH
                ? variationName.substring(0, VARIATION_NAME_MAX_LENGTH)
                : variationName;
    }

    private void evictCache(String slug) {
        String cacheKey = CacheKeyConstants.PRODUCT_SLUG_PREFIX + slug;
        try {
            redisTemplate.delete(cacheKey);
        } catch (Exception e) {
            log.error("Failed to evict product cache key: {}", cacheKey, e);
        }
    }
}
