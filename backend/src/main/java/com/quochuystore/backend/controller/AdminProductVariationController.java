package com.quochuystore.backend.controller;

import com.quochuystore.backend.dto.product.request.VariationRequestDto;
import com.quochuystore.backend.dto.product.request.VariationStockUpdateRequestDto;
import com.quochuystore.backend.dto.product.response.ProductVariationResponseDto;
import com.quochuystore.backend.service.ProductVariationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
public class AdminProductVariationController {

    private final ProductVariationService productVariationService;

    @PostMapping("/admin/colors/{colorId}/variations")
    public ResponseEntity<ProductVariationResponseDto> createVariation(
            @PathVariable Long colorId,
            @Valid @RequestBody VariationRequestDto request) {

        log.info("REST request to create variation for color id: {} with size: {}", colorId, request.getSize());
        ProductVariationResponseDto response = productVariationService.createVariation(colorId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/admin/variations/{id}")
    public ResponseEntity<ProductVariationResponseDto> updateVariation(
            @PathVariable Long id,
            @Valid @RequestBody VariationRequestDto request) {

        log.info("REST request to update variation id: {}", id);
        ProductVariationResponseDto response = productVariationService.updateVariation(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/admin/variations/{id}/stock")
    public ResponseEntity<ProductVariationResponseDto> updateStock(
            @PathVariable Long id,
            @Valid @RequestBody VariationStockUpdateRequestDto request) {

        log.info("REST request to patch variation id: {} stock quantity: {}", id, request.getStockQuantity());
        ProductVariationResponseDto response = productVariationService.updateStock(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/admin/variations/{id}")
    public ResponseEntity<Void> deleteVariation(@PathVariable Long id) {
        log.info("REST request to delete variation id: {}", id);
        productVariationService.deleteVariation(id);
        return ResponseEntity.noContent().build();
    }
}
