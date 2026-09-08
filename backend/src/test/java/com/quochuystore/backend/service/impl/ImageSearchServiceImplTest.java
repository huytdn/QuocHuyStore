package com.quochuystore.backend.service.impl;

import com.quochuystore.backend.entity.enums.UserRole;
import com.quochuystore.backend.exception.BadRequestException;
import com.quochuystore.backend.exception.TooManyRequestsException;
import com.quochuystore.backend.repository.ProductColorRepository;
import com.quochuystore.backend.repository.ProductColorRepository.ImageSearchProjection;
import com.quochuystore.backend.security.UserPrincipal;
import com.quochuystore.backend.service.EmbeddingService;
import com.quochuystore.backend.service.LikeService;
import com.quochuystore.backend.service.RateLimiterService;
import com.quochuystore.backend.dto.product.response.ImageSearchResponseDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ImageSearchServiceImplTest {

    private static final byte[] JPEG_BYTES = new byte[]{
            (byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0, 0, 0, 0, 0, 0, 0, 0, 0
    };

    @Mock
    private EmbeddingService embeddingService;

    @Mock
    private ProductColorRepository productColorRepository;

    @Mock
    private LikeService likeService;

    @Mock
    private RateLimiterService rateLimiterService;

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    private ImageSearchServiceImpl imageSearchService;

    @BeforeEach
    void setUp() {
        ObjectMapper realObjectMapper = new ObjectMapper();
        imageSearchService = new ImageSearchServiceImpl(
                embeddingService, productColorRepository, likeService, rateLimiterService,
                redisTemplate, realObjectMapper);
        ReflectionTestUtils.setField(imageSearchService, "maxDistance", 0.40);
        ReflectionTestUtils.setField(imageSearchService, "defaultTopK", 3);
        ReflectionTestUtils.setField(imageSearchService, "maxTopK", 10);
        ReflectionTestUtils.setField(imageSearchService, "maxFileSizeBytes", 5L * 1024 * 1024);
    }

    private MultipartFile jpegFile() {
        return new MockMultipartFile("file", "shirt.jpg", "image/jpeg", JPEG_BYTES);
    }

    private static ImageSearchProjection projection(Long productId, Long colorId, double distance) {
        return new ImageSearchProjection() {
            @Override
            public Long getProductId() {
                return productId;
            }

            @Override
            public Long getColorId() {
                return colorId;
            }

            @Override
            public String getColorName() {
                return "White";
            }

            @Override
            public String getColorImageUrl() {
                return "http://img/color.jpg";
            }

            @Override
            public String getName() {
                return "Test Product";
            }

            @Override
            public String getSlug() {
                return "test-product";
            }

            @Override
            public String getThumbnailUrl() {
                return "http://img/thumb.jpg";
            }

            @Override
            public String getThumbnailPublicId() {
                return "pub-id";
            }

            @Override
            public BigDecimal getMinPrice() {
                return BigDecimal.valueOf(100000);
            }

            @Override
            public String getCategoryName() {
                return "Shirts";
            }

            @Override
            public BigDecimal getAverageStar() {
                return BigDecimal.valueOf(4.5);
            }

            @Override
            public Integer getReviewCount() {
                return 10;
            }

            @Override
            public Double getDistance() {
                return distance;
            }
        };
    }

    @Test
    void searchByImage_returnsResults_onCacheMiss() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn(null);
        when(embeddingService.embedImage(any(), any())).thenReturn(new float[512]);
        when(embeddingService.toVectorLiteral(any())).thenReturn("[literal]");
        when(productColorRepository.searchByEmbedding(eq("[literal]"), anyDouble(), eq(3)))
                .thenReturn(List.of(projection(1L, 10L, 0.1)));

        ImageSearchResponseDto response = imageSearchService.searchByImage(jpegFile(), null, "1.2.3.4", null);

        assertThat(response.getResults()).hasSize(1);
        assertThat(response.getResults().get(0).getSimilarity()).isEqualTo(0.9);
        assertThat(response.getResults().get(0).getProduct().getIsLikedByMe()).isFalse();
        verify(valueOperations).set(anyString(), anyString(), org.mockito.ArgumentMatchers.eq(30L),
                org.mockito.ArgumentMatchers.any());
    }

    @Test
    void searchByImage_returnsEmptyResults_whenNothingMeetsThreshold() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn(null);
        when(embeddingService.embedImage(any(), any())).thenReturn(new float[512]);
        when(embeddingService.toVectorLiteral(any())).thenReturn("[literal]");
        when(productColorRepository.searchByEmbedding(anyString(), anyDouble(), anyInt())).thenReturn(List.of());

        ImageSearchResponseDto response = imageSearchService.searchByImage(jpegFile(), null, "1.2.3.4", null);

        assertThat(response.getResults()).isEmpty();
    }

    @Test
    void searchByImage_usesCachedResults_andSkipsEmbeddingAndRepository() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString()))
                .thenReturn("[{\"product\":{\"id\":1,\"name\":\"Cached\",\"isLikedByMe\":false},"
                        + "\"colorId\":10,\"colorName\":\"White\",\"similarity\":0.9}]");

        ImageSearchResponseDto response = imageSearchService.searchByImage(jpegFile(), null, "1.2.3.4", null);

        assertThat(response.getResults()).hasSize(1);
        assertThat(response.getResults().get(0).getProduct().getName()).isEqualTo("Cached");
        verify(embeddingService, never()).embedImage(any(), any());
        verify(productColorRepository, never()).searchByEmbedding(anyString(), anyDouble(), anyInt());
    }

    @Test
    void searchByImage_degradesGracefully_whenCacheReadFails() {
        when(redisTemplate.opsForValue()).thenThrow(new RuntimeException("redis down"));
        when(embeddingService.embedImage(any(), any())).thenReturn(new float[512]);
        when(embeddingService.toVectorLiteral(any())).thenReturn("[literal]");
        when(productColorRepository.searchByEmbedding(anyString(), anyDouble(), anyInt()))
                .thenReturn(List.of(projection(1L, 10L, 0.2)));

        ImageSearchResponseDto response = imageSearchService.searchByImage(jpegFile(), null, "1.2.3.4", null);

        assertThat(response.getResults()).hasSize(1);
    }

    @Test
    void searchByImage_decoratesIsLikedByMe_forUserPrincipal() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn(null);
        when(embeddingService.embedImage(any(), any())).thenReturn(new float[512]);
        when(embeddingService.toVectorLiteral(any())).thenReturn("[literal]");
        when(productColorRepository.searchByEmbedding(anyString(), anyDouble(), anyInt()))
                .thenReturn(List.of(projection(1L, 10L, 0.1)));

        UUID userId = UUID.randomUUID();
        UserPrincipal principal = UserPrincipal.builder().id(userId).role(UserRole.USER).build();
        when(likeService.getLikedProductIdsForProducts(eq(userId), any())).thenReturn(Set.of(1L));

        ImageSearchResponseDto response = imageSearchService.searchByImage(jpegFile(), null, "1.2.3.4", principal);

        assertThat(response.getResults().get(0).getProduct().getIsLikedByMe()).isTrue();
    }

    @Test
    void searchByImage_doesNotDecorate_forAdminPrincipal() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn(null);
        when(embeddingService.embedImage(any(), any())).thenReturn(new float[512]);
        when(embeddingService.toVectorLiteral(any())).thenReturn("[literal]");
        when(productColorRepository.searchByEmbedding(anyString(), anyDouble(), anyInt()))
                .thenReturn(List.of(projection(1L, 10L, 0.1)));

        UserPrincipal admin = UserPrincipal.builder().id(UUID.randomUUID()).role(UserRole.ADMIN).build();

        ImageSearchResponseDto response = imageSearchService.searchByImage(jpegFile(), null, "1.2.3.4", admin);

        assertThat(response.getResults().get(0).getProduct().getIsLikedByMe()).isFalse();
        verify(likeService, never()).getLikedProductIdsForProducts(any(), any());
    }

    @Test
    void searchByImage_clampsTopK_toConfiguredMax() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn(null);
        when(embeddingService.embedImage(any(), any())).thenReturn(new float[512]);
        when(embeddingService.toVectorLiteral(any())).thenReturn("[literal]");
        when(productColorRepository.searchByEmbedding(anyString(), anyDouble(), eq(10))).thenReturn(List.of());

        imageSearchService.searchByImage(jpegFile(), 100, "1.2.3.4", null);

        verify(productColorRepository).searchByEmbedding(anyString(), anyDouble(), eq(10));
    }

    @Test
    void searchByImage_throwsBadRequest_whenFileEmpty() {
        MultipartFile empty = new MockMultipartFile("file", "empty.jpg", "image/jpeg", new byte[0]);

        assertThatThrownBy(() -> imageSearchService.searchByImage(empty, null, "1.2.3.4", null))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void searchByImage_throwsBadRequest_whenFileTooLarge() {
        ReflectionTestUtils.setField(imageSearchService, "maxFileSizeBytes", 5L);

        assertThatThrownBy(() -> imageSearchService.searchByImage(jpegFile(), null, "1.2.3.4", null))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void searchByImage_throwsBadRequest_whenContentTypeNotAllowed() {
        MultipartFile textFile = new MockMultipartFile("file", "notes.txt", "text/plain", JPEG_BYTES);

        assertThatThrownBy(() -> imageSearchService.searchByImage(textFile, null, "1.2.3.4", null))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void searchByImage_throwsBadRequest_whenMagicBytesInvalid() {
        byte[] fakeBytes = new byte[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
        MultipartFile disguised = new MockMultipartFile("file", "fake.jpg", "image/jpeg", fakeBytes);

        assertThatThrownBy(() -> imageSearchService.searchByImage(disguised, null, "1.2.3.4", null))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void searchByImage_propagatesRateLimitException_beforeAnyOtherWork() {
        doThrow(new TooManyRequestsException("slow down")).when(rateLimiterService).checkRateLimit("1.2.3.4");

        assertThatThrownBy(() -> imageSearchService.searchByImage(jpegFile(), null, "1.2.3.4", null))
                .isInstanceOf(TooManyRequestsException.class);

        verify(embeddingService, never()).embedImage(any(), any());
    }
}
