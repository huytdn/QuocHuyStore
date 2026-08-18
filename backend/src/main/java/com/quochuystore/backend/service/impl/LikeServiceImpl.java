package com.quochuystore.backend.service.impl;

import com.quochuystore.backend.config.CacheKeyConstants;
import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.mapper.ProductMapper;
import com.quochuystore.backend.dto.product.response.LikeToggleResponseDto;
import com.quochuystore.backend.dto.product.response.ProductListResponseDto;
import com.quochuystore.backend.entity.Like;
import com.quochuystore.backend.entity.Product;
import com.quochuystore.backend.entity.User;
import com.quochuystore.backend.exception.ResourceNotFoundException;
import com.quochuystore.backend.repository.LikeRepository;
import com.quochuystore.backend.repository.ProductRepository;
import com.quochuystore.backend.repository.UserRepository;
import com.quochuystore.backend.service.LikeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LikeServiceImpl implements LikeService {

    private final LikeRepository likeRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final StringRedisTemplate redisTemplate;

    @Override
    @Transactional
    public LikeToggleResponseDto toggleLike(UUID userId, Long productId) {
        log.info("Processing toggle like for userId: {}, productId: {}", userId, productId);

        Product product = productRepository.findById(productId)
                .filter(p -> Boolean.TRUE.equals(p.getIsActive()))
                .orElseThrow(() -> new ResourceNotFoundException("Product not found or inactive with id: " + productId));

        User user = userRepository.findById(userId)
                .filter(u -> Boolean.TRUE.equals(u.getIsActive()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found or inactive with id: " + userId));

        String cacheKey = CacheKeyConstants.USER_LIKES_PREFIX + userId;
        Optional<Like> existingLike = likeRepository.findByUserIdAndProductId(userId, productId);

        if (existingLike.isPresent()) {
            // Unlike operation
            likeRepository.delete(existingLike.get());
            try {
                redisTemplate.opsForSet().remove(cacheKey, productId.toString());
            } catch (Exception e) {
                log.error("Failed to remove productId {} from Redis set for userId {}", productId, userId, e);
            }
            log.info("User {} unliked product {}", userId, productId);
            return LikeToggleResponseDto.builder()
                    .productId(productId)
                    .isLiked(false)
                    .message("Product unliked successfully")
                    .build();
        } else {
            // Like operation
            try {
                Like like = Like.builder()
                        .user(user)
                        .product(product)
                        .build();
                likeRepository.save(like);
            } catch (DataIntegrityViolationException e) {
                log.warn("Concurrent like detected for userId {} and productId {}", userId, productId);
            }

            try {
                redisTemplate.opsForSet().add(cacheKey, productId.toString());
                redisTemplate.expire(cacheKey, CacheKeyConstants.USER_LIKES_TTL_HOURS, TimeUnit.HOURS);
            } catch (Exception e) {
                log.error("Failed to add productId {} to Redis set for userId {}", productId, userId, e);
            }
            log.info("User {} liked product {}", userId, productId);
            return LikeToggleResponseDto.builder()
                    .productId(productId)
                    .isLiked(true)
                    .message("Product liked successfully")
                    .build();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isProductLikedByUser(UUID userId, Long productId) {
        if (userId == null || productId == null) {
            return false;
        }

        String cacheKey = CacheKeyConstants.USER_LIKES_PREFIX + userId;

        try {
            if (Boolean.TRUE.equals(redisTemplate.hasKey(cacheKey))) {
                Boolean isMember = redisTemplate.opsForSet().isMember(cacheKey, productId.toString());
                return Boolean.TRUE.equals(isMember);
            }
        } catch (Exception e) {
            log.error("Failed to check Redis like cache for user: {}, product: {}", userId, productId, e);
        }

        // Cache miss: Load user's liked products into Redis
        Set<Long> userLikedIds = loadUserLikesIntoCache(userId, cacheKey);
        return userLikedIds.contains(productId);
    }

    @Override
    @Transactional(readOnly = true)
    public Set<Long> getLikedProductIdsForProducts(UUID userId, Collection<Long> productIds) {
        if (userId == null || productIds == null || productIds.isEmpty()) {
            return Collections.emptySet();
        }

        String cacheKey = CacheKeyConstants.USER_LIKES_PREFIX + userId;

        try {
            if (Boolean.TRUE.equals(redisTemplate.hasKey(cacheKey))) {
                Set<Long> liked = new HashSet<>();
                for (Long pid : productIds) {
                    if (Boolean.TRUE.equals(redisTemplate.opsForSet().isMember(cacheKey, pid.toString()))) {
                        liked.add(pid);
                    }
                }
                return liked;
            }
        } catch (Exception e) {
            log.error("Failed to read user likes from Redis for user: {}", userId, e);
        }

        // Cache miss: Load user's liked products into Redis
        Set<Long> userLikedIds = loadUserLikesIntoCache(userId, cacheKey);
        return userLikedIds.stream().filter(productIds::contains).collect(Collectors.toSet());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDto<ProductListResponseDto> getLikedProducts(UUID userId, Pageable pageable) {
        log.info("Fetching liked products for userId: {}, pageable: {}", userId, pageable);

        Page<Product> likedPage = likeRepository.findLikedProductsByUserId(userId, pageable);

        List<ProductListResponseDto> content = likedPage.getContent().stream()
                .map(product -> ProductMapper.toProductListResponseDto(product, true))
                .toList();

        return PageResponseDto.<ProductListResponseDto>builder()
                .content(content)
                .pageNo(likedPage.getNumber())
                .pageSize(likedPage.getSize())
                .totalElements(likedPage.getTotalElements())
                .totalPages(likedPage.getTotalPages())
                .last(likedPage.isLast())
                .build();
    }

    private Set<Long> loadUserLikesIntoCache(UUID userId, String cacheKey) {
        Set<Long> likedIds = likeRepository.findProductIdsByUserId(userId);
        try {
            if (!likedIds.isEmpty()) {
                String[] strIds = likedIds.stream().map(String::valueOf).toArray(String[]::new);
                redisTemplate.opsForSet().add(cacheKey, strIds);
                redisTemplate.expire(cacheKey, CacheKeyConstants.USER_LIKES_TTL_HOURS, TimeUnit.HOURS);
            }
        } catch (Exception e) {
            log.error("Failed to populate Redis user likes cache for user: {}", userId, e);
        }
        return likedIds;
    }
}
