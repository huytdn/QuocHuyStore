package com.quochuystore.backend.service;

import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.product.response.LikeToggleResponseDto;
import com.quochuystore.backend.dto.product.response.ProductListResponseDto;
import org.springframework.data.domain.Pageable;

import java.util.Collection;
import java.util.Set;
import java.util.UUID;

public interface LikeService {

    LikeToggleResponseDto toggleLike(UUID userId, Long productId);

    boolean isProductLikedByUser(UUID userId, Long productId);

    Set<Long> getLikedProductIdsForProducts(UUID userId, Collection<Long> productIds);

    PageResponseDto<ProductListResponseDto> getLikedProducts(UUID userId, Pageable pageable);
}
