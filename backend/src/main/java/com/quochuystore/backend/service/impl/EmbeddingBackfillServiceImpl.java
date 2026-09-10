package com.quochuystore.backend.service.impl;

import com.quochuystore.backend.dto.product.response.EmbeddingBackfillResponseDto;
import com.quochuystore.backend.repository.ProductColorRepository;
import com.quochuystore.backend.repository.ProductColorRepository.ColorMissingEmbeddingProjection;
import com.quochuystore.backend.service.EmbeddingBackfillService;
import com.quochuystore.backend.service.EmbeddingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmbeddingBackfillServiceImpl implements EmbeddingBackfillService {

    private static final int MAX_BATCH_SIZE = 20;

    private final ProductColorRepository productColorRepository;
    private final EmbeddingService embeddingService;

    @Override
    @Transactional
    public EmbeddingBackfillResponseDto backfillMissingEmbeddings(int batchSize) {
        int effectiveBatchSize = Math.max(1, Math.min(batchSize, MAX_BATCH_SIZE));

        List<ColorMissingEmbeddingProjection> colors =
                productColorRepository.findColorsMissingEmbedding(effectiveBatchSize);

        int processed = 0;
        if (!colors.isEmpty()) {
            Map<Long, String> urlsByColorId = colors.stream()
                    .collect(Collectors.toMap(ColorMissingEmbeddingProjection::getId,
                            ColorMissingEmbeddingProjection::getImageUrl));

            Map<Long, float[]> embeddingsByColorId = embeddingService.embedImageUrls(urlsByColorId);

            for (Map.Entry<Long, float[]> entry : embeddingsByColorId.entrySet()) {
                String vectorLiteral = embeddingService.toVectorLiteral(entry.getValue());
                productColorRepository.updateImageEmbedding(entry.getKey(), vectorLiteral);
                processed++;
            }
        }

        long remaining = productColorRepository.countColorsMissingEmbedding();
        log.info("Embedding backfill batch complete: processed {} colors, {} remaining", processed, remaining);

        return EmbeddingBackfillResponseDto.builder()
                .processed(processed)
                .remaining((int) remaining)
                .build();
    }
}
