package com.quochuystore.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quochuystore.backend.dto.product.request.ProductCreateRequestDto;
import com.quochuystore.backend.dto.product.request.ProductUpdateRequestDto;
import com.quochuystore.backend.dto.product.response.ProductDetailResponseDto;
import com.quochuystore.backend.service.ProductService;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

@RestController
@RequestMapping("/admin/products")
@RequiredArgsConstructor
@Slf4j
public class AdminProductController {

    private final ProductService productService;
    private final ObjectMapper objectMapper;
    private final Validator validator;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDetailResponseDto> createProduct(
            @RequestPart("file") MultipartFile file,
            @RequestPart("metadata") String metadataJson) {

        log.info("REST request to create product with metadata: {}", metadataJson);
        ProductCreateRequestDto request;
        try {
            request = objectMapper.readValue(metadataJson, ProductCreateRequestDto.class);
        } catch (Exception e) {
            log.error("Failed to parse product metadata JSON", e);
            throw new IllegalArgumentException("Invalid product metadata JSON structure");
        }

        Set<ConstraintViolation<ProductCreateRequestDto>> violations = validator.validate(request);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }

        ProductDetailResponseDto response = productService.createProduct(request, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDetailResponseDto> updateProduct(
            @PathVariable Long id,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart("metadata") String metadataJson) {

        log.info("REST request to update product id: {} with metadata: {}", id, metadataJson);
        ProductUpdateRequestDto request;
        try {
            request = objectMapper.readValue(metadataJson, ProductUpdateRequestDto.class);
        } catch (Exception e) {
            log.error("Failed to parse product metadata JSON", e);
            throw new IllegalArgumentException("Invalid product metadata JSON structure");
        }

        Set<ConstraintViolation<ProductUpdateRequestDto>> violations = validator.validate(request);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }

        ProductDetailResponseDto response = productService.updateProduct(id, request, file);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        log.info("REST request to delete product id: {}", id);
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
