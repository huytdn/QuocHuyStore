package com.quochuystore.backend.service.impl;

import com.quochuystore.backend.dto.product.response.EmbeddingBackfillResponseDto;
import com.quochuystore.backend.exception.EmbeddingServiceException;
import com.quochuystore.backend.repository.ProductColorRepository;
import com.quochuystore.backend.repository.ProductColorRepository.ColorMissingEmbeddingProjection;
import com.quochuystore.backend.service.EmbeddingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmbeddingBackfillServiceImplTest {

    @Mock
    private ProductColorRepository productColorRepository;

    @Mock
    private EmbeddingService embeddingService;

    private EmbeddingBackfillServiceImpl backfillService;

    @BeforeEach
    void setUp() {
        backfillService = new EmbeddingBackfillServiceImpl(productColorRepository, embeddingService);
    }

    private static ColorMissingEmbeddingProjection projection(Long id, String url) {
        return new ColorMissingEmbeddingProjection() {
            @Override
            public Long getId() {
                return id;
            }

            @Override
            public String getImageUrl() {
                return url;
            }
        };
    }

    @Test
    void backfill_persistsOnlySuccessfulResults_andReturnsCounts() {
        when(productColorRepository.findColorsMissingEmbedding(anyInt()))
                .thenReturn(List.of(projection(1L, "http://a"), projection(2L, "http://b")));

        float[] embeddingA = new float[512];
        when(embeddingService.embedImageUrls(Map.of(1L, "http://a", 2L, "http://b")))
                .thenReturn(Map.of(1L, embeddingA));
        when(embeddingService.toVectorLiteral(embeddingA)).thenReturn("[literalA]");
        when(productColorRepository.countColorsMissingEmbedding()).thenReturn(5L);

        EmbeddingBackfillResponseDto result = backfillService.backfillMissingEmbeddings(32);

        verify(productColorRepository).updateImageEmbedding(1L, "[literalA]");
        verify(productColorRepository, never()).updateImageEmbedding(eq(2L), anyString());
        assertThat(result.getProcessed()).isEqualTo(1);
        assertThat(result.getRemaining()).isEqualTo(5);
    }

    @Test
    void backfill_clampsBatchSize_toConfiguredMax() {
        when(productColorRepository.findColorsMissingEmbedding(anyInt())).thenReturn(List.of());
        when(productColorRepository.countColorsMissingEmbedding()).thenReturn(0L);

        backfillService.backfillMissingEmbeddings(1000);

        verify(productColorRepository).findColorsMissingEmbedding(32);
    }

    @Test
    void backfill_returnsZeroProcessed_whenNothingIsMissing() {
        when(productColorRepository.findColorsMissingEmbedding(anyInt())).thenReturn(List.of());
        when(productColorRepository.countColorsMissingEmbedding()).thenReturn(0L);

        EmbeddingBackfillResponseDto result = backfillService.backfillMissingEmbeddings(32);

        assertThat(result.getProcessed()).isZero();
        assertThat(result.getRemaining()).isZero();
        verify(embeddingService, never()).embedImageUrls(anyMapAny());
        verify(productColorRepository, never()).updateImageEmbedding(anyLong(), anyString());
    }

    @Test
    void backfill_propagatesEmbeddingServiceException_whenBatchCallFails() {
        when(productColorRepository.findColorsMissingEmbedding(anyInt()))
                .thenReturn(List.of(projection(1L, "http://a")));
        when(embeddingService.embedImageUrls(Map.of(1L, "http://a")))
                .thenThrow(new EmbeddingServiceException("AI service down"));

        assertThatThrownBy(() -> backfillService.backfillMissingEmbeddings(32))
                .isInstanceOf(EmbeddingServiceException.class);

        verify(productColorRepository, never()).updateImageEmbedding(anyLong(), anyString());
    }

    @SuppressWarnings("unchecked")
    private static Map<Long, String> anyMapAny() {
        return (Map<Long, String>) org.mockito.ArgumentMatchers.any(Map.class);
    }
}
