package com.quochuystore.backend.service;

import com.quochuystore.backend.dto.product.response.EmbeddingBackfillResponseDto;

public interface EmbeddingBackfillService {
    EmbeddingBackfillResponseDto backfillMissingEmbeddings(int batchSize);
}
