package com.quochuystore.backend.controller;

import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.product.response.LikeToggleResponseDto;
import com.quochuystore.backend.dto.product.response.ProductListResponseDto;
import com.quochuystore.backend.security.UserPrincipal;
import com.quochuystore.backend.service.LikeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
public class LikeController {

    private final LikeService likeService;

    @PostMapping("/products/{productId}/like")
    public ResponseEntity<LikeToggleResponseDto> toggleLike(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserPrincipal principal) {
        log.info("REST request to toggle like for productId: {} by userId: {}", productId, principal.getId());
        LikeToggleResponseDto response = likeService.toggleLike(principal.getId(), productId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/me/likes")
    public ResponseEntity<PageResponseDto<ProductListResponseDto>> getLikedProducts(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("REST request to get liked products for userId: {}, page: {}, size: {}", principal.getId(), page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PageResponseDto<ProductListResponseDto> response = likeService.getLikedProducts(principal.getId(), pageable);
        return ResponseEntity.ok(response);
    }
}
