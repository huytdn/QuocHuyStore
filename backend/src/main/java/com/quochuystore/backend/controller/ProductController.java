package com.quochuystore.backend.controller;

import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.product.response.ProductDetailResponseDto;
import com.quochuystore.backend.dto.product.response.ProductListResponseDto;
import com.quochuystore.backend.service.ProductService;
import com.quochuystore.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Slf4j
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<PageResponseDto<ProductListResponseDto>> getProducts(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {

        log.info(
                "REST request to get products. user: {}, categoryId: {}, search: {}, minPrice: {}, maxPrice: {}, page: {}, size: {}, sort: {}",
                principal != null ? principal.getId() : "anonymous", categoryId, search, minPrice, maxPrice, page, size, sort);

        String[] sortParams = sort.split(",");
        String property = sortParams[0];
        Sort.Direction direction = Sort.Direction.DESC;
        if (sortParams.length > 1 && "asc".equalsIgnoreCase(sortParams[1])) {
            direction = Sort.Direction.ASC;
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, property));
        PageResponseDto<ProductListResponseDto> response = productService.getProducts(
                categoryId, search, minPrice, maxPrice, pageable, principal);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ProductDetailResponseDto> getProductBySlug(
            @PathVariable String slug,
            @AuthenticationPrincipal UserPrincipal principal) {
        log.info("REST request to get product detail by slug: {}, user: {}",
                slug, principal != null ? principal.getId() : "anonymous");
        ProductDetailResponseDto response = productService.getProductBySlug(slug, principal);
        return ResponseEntity.ok(response);
    }
}
