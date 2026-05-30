package com.quochuystore.backend.controller;

import com.quochuystore.backend.dto.product.response.ProductColorResponseDto;
import com.quochuystore.backend.service.base.ProductColorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@Slf4j
public class ProductColorController {

    private final ProductColorService productColorService;

    @PostMapping(value = "/admin/products/{productId}/colors", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductColorResponseDto> createColor(
            @PathVariable Long productId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("colorName") String colorName) {

        log.info("REST request to create color: '{}' for product: {}", colorName, productId);
        ProductColorResponseDto response = productColorService.createColor(productId, colorName, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping(value = "/admin/colors/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductColorResponseDto> updateColor(
            @PathVariable Long id,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("colorName") String colorName) {

        log.info("REST request to update color id: {} with name: '{}'", id, colorName);
        ProductColorResponseDto response = productColorService.updateColor(id, colorName, file);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/admin/colors/{id}")
    public ResponseEntity<Void> deleteColor(@PathVariable Long id) {
        log.info("REST request to delete color id: {}", id);
        productColorService.deleteColor(id);
        return ResponseEntity.noContent().build();
    }
}
