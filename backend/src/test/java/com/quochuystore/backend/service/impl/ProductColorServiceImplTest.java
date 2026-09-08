package com.quochuystore.backend.service.impl;

import com.quochuystore.backend.dto.product.response.ProductColorResponseDto;
import com.quochuystore.backend.entity.Product;
import com.quochuystore.backend.entity.ProductColor;
import com.quochuystore.backend.exception.EmbeddingServiceException;
import com.quochuystore.backend.repository.ProductColorRepository;
import com.quochuystore.backend.repository.ProductRepository;
import com.quochuystore.backend.repository.ProductVariationRepository;
import com.quochuystore.backend.service.EmbeddingService;
import com.quochuystore.backend.service.ImageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductColorServiceImplTest {

    @Mock
    private ProductColorRepository productColorRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductVariationRepository productVariationRepository;

    @Mock
    private ImageService imageService;

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private EmbeddingService embeddingService;

    @Mock
    private MultipartFile file;

    private ProductColorServiceImpl productColorService;

    private Product product;

    @BeforeEach
    void setUp() {
        productColorService = new ProductColorServiceImpl(
                productColorRepository, productRepository, productVariationRepository,
                imageService, redisTemplate, embeddingService);

        product = Product.builder().id(1L).slug("test-product").build();

        lenient().when(productVariationRepository.findByProductColorIdAndIsActive(anyLong(), eq(true)))
                .thenReturn(List.of());
    }

    private void stubFile(boolean empty) throws IOException {
        when(file.isEmpty()).thenReturn(empty);
        if (!empty) {
            lenient().when(file.getBytes()).thenReturn("image-bytes".getBytes());
            lenient().when(file.getOriginalFilename()).thenReturn("shirt.jpg");
        }
    }

    @Test
    void createColor_persistsEmbedding_whenEmbeddingSucceeds() throws IOException {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productColorRepository.existsByProductIdAndColorNameIgnoreCase(1L, "White")).thenReturn(false);
        stubFile(false);
        when(imageService.uploadImage(file)).thenReturn(Map.of("url", "http://img", "public_id", "pub1"));

        ProductColor saved = ProductColor.builder().id(10L).product(product).colorName("White").isActive(true).build();
        when(productColorRepository.saveAndFlush(any(ProductColor.class))).thenReturn(saved);

        float[] embedding = new float[512];
        embedding[0] = 0.5f;
        when(embeddingService.embedImage(any(byte[].class), eq("shirt.jpg"))).thenReturn(embedding);
        when(embeddingService.toVectorLiteral(embedding)).thenReturn("[0.5,...]");

        ProductColorResponseDto result = productColorService.createColor(1L, "White", file);

        assertThat(result).isNotNull();
        verify(productColorRepository).updateImageEmbedding(10L, "[0.5,...]");
    }

    @Test
    void createColor_stillSavesColor_whenEmbeddingFails() throws IOException {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productColorRepository.existsByProductIdAndColorNameIgnoreCase(1L, "White")).thenReturn(false);
        stubFile(false);
        when(imageService.uploadImage(file)).thenReturn(Map.of("url", "http://img", "public_id", "pub1"));

        ProductColor saved = ProductColor.builder().id(10L).product(product).colorName("White").isActive(true).build();
        when(productColorRepository.saveAndFlush(any(ProductColor.class))).thenReturn(saved);

        when(embeddingService.embedImage(any(byte[].class), anyString()))
                .thenThrow(new EmbeddingServiceException("AI service down"));

        ProductColorResponseDto result = productColorService.createColor(1L, "White", file);

        assertThat(result).isNotNull();
        verify(productColorRepository, never()).updateImageEmbedding(anyLong(), anyString());
    }

    @Test
    void updateColor_reEmbeds_whenNewFileProvided() throws IOException {
        ProductColor existing = ProductColor.builder().id(20L).product(product).colorName("Old")
                .imagePublicId("oldPub").isActive(true).build();
        when(productColorRepository.findById(20L)).thenReturn(Optional.of(existing));
        when(productColorRepository.existsByProductIdAndColorNameIgnoreCaseAndIdNot(1L, "New", 20L)).thenReturn(false);
        stubFile(false);
        when(imageService.uploadImage(file)).thenReturn(Map.of("url", "http://img2", "public_id", "pub2"));
        when(productColorRepository.saveAndFlush(any(ProductColor.class))).thenReturn(existing);

        float[] embedding = new float[512];
        when(embeddingService.embedImage(any(byte[].class), eq("shirt.jpg"))).thenReturn(embedding);
        when(embeddingService.toVectorLiteral(embedding)).thenReturn("[0.0,...]");

        productColorService.updateColor(20L, "New", file);

        verify(productColorRepository).updateImageEmbedding(20L, "[0.0,...]");
    }

    @Test
    void updateColor_doesNotReEmbed_whenNoFileProvided() {
        ProductColor existing = ProductColor.builder().id(20L).product(product).colorName("Old")
                .imagePublicId("oldPub").isActive(true).build();
        when(productColorRepository.findById(20L)).thenReturn(Optional.of(existing));
        when(productColorRepository.existsByProductIdAndColorNameIgnoreCaseAndIdNot(1L, "New", 20L)).thenReturn(false);
        when(productColorRepository.saveAndFlush(any(ProductColor.class))).thenReturn(existing);

        productColorService.updateColor(20L, "New", null);

        verify(embeddingService, never()).embedImage(any(), any());
        verify(productColorRepository, never()).updateImageEmbedding(anyLong(), anyString());
    }

    @Test
    void updateColor_stillSaves_whenEmbeddingFailsOnFileChange() throws IOException {
        ProductColor existing = ProductColor.builder().id(20L).product(product).colorName("Old")
                .imagePublicId("oldPub").isActive(true).build();
        when(productColorRepository.findById(20L)).thenReturn(Optional.of(existing));
        when(productColorRepository.existsByProductIdAndColorNameIgnoreCaseAndIdNot(1L, "New", 20L)).thenReturn(false);
        stubFile(false);
        when(imageService.uploadImage(file)).thenReturn(Map.of("url", "http://img2", "public_id", "pub2"));
        when(productColorRepository.saveAndFlush(any(ProductColor.class))).thenReturn(existing);

        when(embeddingService.embedImage(any(byte[].class), anyString()))
                .thenThrow(new EmbeddingServiceException("AI service down"));

        ProductColorResponseDto result = productColorService.updateColor(20L, "New", file);

        assertThat(result).isNotNull();
        verify(productColorRepository, never()).updateImageEmbedding(anyLong(), anyString());
    }

    @Test
    void createColor_neverCallsUpdateImageEmbedding_beforeSaveAndFlushReturns() throws IOException {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productColorRepository.existsByProductIdAndColorNameIgnoreCase(1L, "White")).thenReturn(false);
        stubFile(false);
        when(imageService.uploadImage(file)).thenReturn(Map.of("url", "http://img", "public_id", "pub1"));

        ProductColor saved = ProductColor.builder().id(10L).product(product).colorName("White").isActive(true).build();
        when(productColorRepository.saveAndFlush(any(ProductColor.class))).thenReturn(saved);

        float[] embedding = new float[512];
        when(embeddingService.embedImage(any(byte[].class), anyString())).thenReturn(embedding);
        when(embeddingService.toVectorLiteral(embedding)).thenReturn("[literal]");

        productColorService.createColor(1L, "White", file);

        ArgumentCaptor<Long> idCaptor = ArgumentCaptor.forClass(Long.class);
        verify(productColorRepository).updateImageEmbedding(idCaptor.capture(), eq("[literal]"));
        assertThat(idCaptor.getValue()).isEqualTo(10L);
    }
}
