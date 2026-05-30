package com.quochuystore.backend.controller;

import tools.jackson.databind.ObjectMapper;
import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.product.request.ProductCreateRequestDto;
import com.quochuystore.backend.dto.product.request.ProductUpdateRequestDto;
import com.quochuystore.backend.dto.product.response.ProductDetailResponseDto;
import com.quochuystore.backend.dto.product.response.ProductListResponseDto;
import com.quochuystore.backend.service.base.ProductService;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.Set;

@RestController
@RequiredArgsConstructor
@Slf4j
public class ProductController {

    private final ProductService productService;
    private final ObjectMapper objectMapper;
    private final Validator validator;

    @GetMapping("/products")
    public ResponseEntity<PageResponseDto<ProductListResponseDto>> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {

        log.info(
                "REST request to get products. categoryId: {}, search: {}, minPrice: {}, maxPrice: {}, page: {}, size: {}, sort: {}",
                categoryId, search, minPrice, maxPrice, page, size, sort);

        String[] sortParams = sort.split(",");
        String property = sortParams[0];
        Sort.Direction direction = Sort.Direction.DESC;
        if (sortParams.length > 1 && "asc".equalsIgnoreCase(sortParams[1])) {
            direction = Sort.Direction.ASC;
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, property));
        PageResponseDto<ProductListResponseDto> response = productService.getProducts(
                categoryId, search, minPrice, maxPrice, pageable);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/products/{slug}")
    public ResponseEntity<ProductDetailResponseDto> getProductBySlug(@PathVariable String slug) {
        log.info("REST request to get product detail by slug: {}", slug);
        ProductDetailResponseDto response = productService.getProductBySlug(slug);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/admin/products", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
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

        // Validate deserialized object manually since @Valid won't run automatically on
        // manually parsed objects
        Set<ConstraintViolation<ProductCreateRequestDto>> violations = validator.validate(request);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }

        ProductDetailResponseDto response = productService.createProduct(request, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping(value = "/admin/products/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
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

    @DeleteMapping("/admin/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        log.info("REST request to delete product id: {}", id);
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
