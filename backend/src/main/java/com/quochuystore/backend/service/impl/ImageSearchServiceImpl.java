package com.quochuystore.backend.service.impl;

import com.quochuystore.backend.config.CacheKeyConstants;
import com.quochuystore.backend.dto.mapper.ProductMapper;
import com.quochuystore.backend.dto.product.response.ImageSearchResponseDto;
import com.quochuystore.backend.dto.product.response.ImageSearchResultDto;
import com.quochuystore.backend.entity.enums.UserRole;
import com.quochuystore.backend.exception.BadRequestException;
import com.quochuystore.backend.repository.ProductColorRepository;
import com.quochuystore.backend.security.UserPrincipal;
import com.quochuystore.backend.service.EmbeddingService;
import com.quochuystore.backend.service.ImageSearchService;
import com.quochuystore.backend.service.LikeService;
import com.quochuystore.backend.service.RateLimiterService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class ImageSearchServiceImpl implements ImageSearchService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private static final int MIN_MAGIC_BYTES_LENGTH = 12;

    private final EmbeddingService embeddingService;
    private final ProductColorRepository productColorRepository;
    private final LikeService likeService;
    private final RateLimiterService rateLimiterService;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.image-search.max-distance}")
    private double maxDistance;

    @Value("${app.image-search.default-top-k}")
    private int defaultTopK;

    @Value("${app.image-search.max-top-k}")
    private int maxTopK;

    @Value("${app.image-search.max-file-size-bytes}")
    private long maxFileSizeBytes;

    public ImageSearchServiceImpl(EmbeddingService embeddingService, ProductColorRepository productColorRepository,
            LikeService likeService, RateLimiterService rateLimiterService, StringRedisTemplate redisTemplate,
            ObjectMapper objectMapper) {
        this.embeddingService = embeddingService;
        this.productColorRepository = productColorRepository;
        this.likeService = likeService;
        this.rateLimiterService = rateLimiterService;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public ImageSearchResponseDto searchByImage(MultipartFile file, Integer topK, String clientIp,
            UserPrincipal principal) {
        rateLimiterService.checkRateLimit(clientIp);
        validateFile(file);

        byte[] bytes = readBytes(file);
        validateMagicBytes(bytes);

        int effectiveTopK = resolveTopK(topK);
        String cacheKey = buildCacheKey(bytes, effectiveTopK);

        List<ImageSearchResultDto> results = readCache(cacheKey);
        if (results == null) {
            float[] embedding = embeddingService.embedImage(bytes, file.getOriginalFilename());
            String vectorLiteral = embeddingService.toVectorLiteral(embedding);
            List<ProductColorRepository.ImageSearchProjection> rows =
                    productColorRepository.searchByEmbedding(vectorLiteral, maxDistance, effectiveTopK);
            results = rows.stream()
                    .map(row -> ProductMapper.toImageSearchResultDto(row, false))
                    .toList();
            writeCache(cacheKey, results);
        }

        decorateLikes(results, principal);

        return ImageSearchResponseDto.builder().results(results).build();
    }

    private int resolveTopK(Integer topK) {
        if (topK == null) {
            return defaultTopK;
        }
        return Math.min(Math.max(topK, 1), maxTopK);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Image file is required");
        }
        if (file.getSize() > maxFileSizeBytes) {
            throw new BadRequestException("Image file exceeds the maximum allowed size");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Unsupported image type. Allowed: JPEG, PNG, WEBP");
        }
    }

    private byte[] readBytes(MultipartFile file) {
        try {
            return file.getBytes();
        } catch (IOException e) {
            throw new BadRequestException("Unable to read uploaded file");
        }
    }

    private void validateMagicBytes(byte[] bytes) {
        if (!hasValidImageMagicBytes(bytes)) {
            throw new BadRequestException("File content does not match a valid image format");
        }
    }

    private boolean hasValidImageMagicBytes(byte[] b) {
        if (b.length < MIN_MAGIC_BYTES_LENGTH) {
            return false;
        }
        boolean jpeg = (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF;
        boolean png = (b[0] & 0xFF) == 0x89 && b[1] == 0x50 && b[2] == 0x4E && b[3] == 0x47;
        boolean webp = b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P';
        return jpeg || png || webp;
    }

    private String buildCacheKey(byte[] bytes, int topK) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(bytes);
            return CacheKeyConstants.IMAGE_SEARCH_PREFIX + HexFormat.of().formatHex(hash) + ":" + topK;
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 is a mandatory JVM algorithm; this is unreachable in practice.
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    private List<ImageSearchResultDto> readCache(String cacheKey) {
        try {
            String json = redisTemplate.opsForValue().get(cacheKey);
            if (json != null) {
                log.info("Cache Hit for image search key: {}", cacheKey);
                return objectMapper.readValue(json, new TypeReference<List<ImageSearchResultDto>>() {
                });
            }
        } catch (Exception e) {
            log.error("Failed to read image search cache for key: {}", cacheKey, e);
        }
        return null;
    }

    private void writeCache(String cacheKey, List<ImageSearchResultDto> results) {
        try {
            String json = objectMapper.writeValueAsString(results);
            redisTemplate.opsForValue().set(cacheKey, json, CacheKeyConstants.IMAGE_SEARCH_TTL_MINUTES,
                    TimeUnit.MINUTES);
        } catch (Exception e) {
            log.error("Failed to write image search cache for key: {}", cacheKey, e);
        }
    }

    private void decorateLikes(List<ImageSearchResultDto> results, UserPrincipal principal) {
        if (principal == null || principal.getRole() != UserRole.USER || results.isEmpty()) {
            return;
        }
        List<Long> productIds = results.stream().map(r -> r.getProduct().getId()).toList();
        Set<Long> likedProductIds = likeService.getLikedProductIdsForProducts(principal.getId(), productIds);
        for (ImageSearchResultDto result : results) {
            if (likedProductIds.contains(result.getProduct().getId())) {
                result.getProduct().setIsLikedByMe(true);
            }
        }
    }
}
