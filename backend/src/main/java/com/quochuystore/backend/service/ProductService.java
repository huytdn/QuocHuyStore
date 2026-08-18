package com.quochuystore.backend.service;

import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.product.request.ProductCreateRequestDto;
import com.quochuystore.backend.dto.product.request.ProductUpdateRequestDto;
import com.quochuystore.backend.dto.product.response.ProductDetailResponseDto;
import com.quochuystore.backend.dto.product.response.ProductListResponseDto;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.quochuystore.backend.security.UserPrincipal;

import java.math.BigDecimal;

public interface ProductService {
    PageResponseDto<ProductListResponseDto> getProducts(
            Long categoryId,
            String search,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Pageable pageable,
            UserPrincipal principal);

    PageResponseDto<ProductListResponseDto> getProducts(
            Long categoryId,
            String search,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Pageable pageable);

    ProductDetailResponseDto getProductBySlug(String slug, UserPrincipal principal);

    ProductDetailResponseDto getProductBySlug(String slug);

    ProductDetailResponseDto getProductById(Long id);

    ProductDetailResponseDto createProduct(ProductCreateRequestDto request, MultipartFile file);

    ProductDetailResponseDto updateProduct(Long id, ProductUpdateRequestDto request, MultipartFile file);

    void deleteProduct(Long id);
}
