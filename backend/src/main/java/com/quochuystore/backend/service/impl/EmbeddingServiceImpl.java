package com.quochuystore.backend.service.impl;

import com.quochuystore.backend.dto.embedding.request.EmbedBatchItemDto;
import com.quochuystore.backend.dto.embedding.request.EmbedBatchRequestDto;
import com.quochuystore.backend.dto.embedding.response.EmbedBatchFailureDto;
import com.quochuystore.backend.dto.embedding.response.EmbedBatchResponseDto;
import com.quochuystore.backend.dto.embedding.response.EmbedBatchResultDto;
import com.quochuystore.backend.dto.embedding.response.EmbeddingResponseDto;
import com.quochuystore.backend.exception.EmbeddingServiceException;
import com.quochuystore.backend.service.EmbeddingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class EmbeddingServiceImpl implements EmbeddingService {

    private static final int EXPECTED_DIMENSIONS = 512;
    private static final String DEFAULT_FILENAME = "upload.jpg";

    private final RestClient aiServiceRestClient;

    public EmbeddingServiceImpl(RestClient aiServiceRestClient) {
        this.aiServiceRestClient = aiServiceRestClient;
    }

    @Override
    public float[] embedImage(byte[] imageBytes, String filename) {
        String safeFilename = (filename == null || filename.isBlank()) ? DEFAULT_FILENAME : filename;

        ByteArrayResource filePart = new ByteArrayResource(imageBytes) {
            @Override
            public String getFilename() {
                return safeFilename;
            }
        };

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", filePart);

        EmbeddingResponseDto response;
        try {
            response = aiServiceRestClient.post()
                    .uri("/embed")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(EmbeddingResponseDto.class);
        } catch (Exception e) {
            log.error("Failed to call AI image search service", e);
            throw new EmbeddingServiceException("AI image search service is unavailable", e);
        }

        if (response == null || response.getEmbedding() == null) {
            throw new EmbeddingServiceException("AI image search service returned an empty response");
        }

        if (response.getEmbedding().length != EXPECTED_DIMENSIONS) {
            throw new EmbeddingServiceException(
                    "Expected " + EXPECTED_DIMENSIONS + "-dim embedding, got " + response.getEmbedding().length);
        }

        return response.getEmbedding();
    }

    @Override
    public Map<Long, float[]> embedImageUrls(Map<Long, String> imageUrlsById) {
        if (imageUrlsById.isEmpty()) {
            return Map.of();
        }

        List<EmbedBatchItemDto> items = imageUrlsById.entrySet().stream()
                .map(entry -> new EmbedBatchItemDto(entry.getKey(), entry.getValue()))
                .toList();

        EmbedBatchResponseDto response;
        try {
            response = aiServiceRestClient.post()
                    .uri("/embed-batch")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new EmbedBatchRequestDto(items))
                    .retrieve()
                    .body(EmbedBatchResponseDto.class);
        } catch (Exception e) {
            log.error("Failed to call AI image search service for batch embedding", e);
            throw new EmbeddingServiceException("AI image search service is unavailable", e);
        }

        if (response == null) {
            throw new EmbeddingServiceException("AI image search service returned an empty batch response");
        }

        for (EmbedBatchFailureDto failure : response.getFailures()) {
            log.warn("Failed to embed color id: {} during batch embedding: {}", failure.getId(), failure.getError());
        }

        Map<Long, float[]> result = new HashMap<>();
        for (EmbedBatchResultDto item : response.getResults()) {
            if (item.getEmbedding() != null && item.getEmbedding().length == EXPECTED_DIMENSIONS) {
                result.put(item.getId(), item.getEmbedding());
            } else {
                log.warn("Skipping color id: {} — batch embedding had unexpected dimension", item.getId());
            }
        }
        return result;
    }

    @Override
    public String toVectorLiteral(float[] embedding) {
        StringBuilder literal = new StringBuilder("[");
        for (int i = 0; i < embedding.length; i++) {
            if (i > 0) {
                literal.append(",");
            }
            literal.append(Float.toString(embedding[i]));
        }
        literal.append("]");
        return literal.toString();
    }
}
