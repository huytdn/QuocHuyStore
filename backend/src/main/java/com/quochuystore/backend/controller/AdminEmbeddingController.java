package com.quochuystore.backend.controller;

import com.quochuystore.backend.dto.product.response.EmbeddingBackfillResponseDto;
import com.quochuystore.backend.service.EmbeddingBackfillService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/products")
@RequiredArgsConstructor
@Slf4j
public class AdminEmbeddingController {

    private final EmbeddingBackfillService embeddingBackfillService;

    @PostMapping("/reindex-embeddings")
    public ResponseEntity<EmbeddingBackfillResponseDto> reindexEmbeddings(
            @RequestParam(defaultValue = "20") int batchSize) {
        log.info("Admin triggered image embedding backfill, batchSize: {}", batchSize);
        EmbeddingBackfillResponseDto response = embeddingBackfillService.backfillMissingEmbeddings(batchSize);
        return ResponseEntity.ok(response);
    }
}
