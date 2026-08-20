package com.quochuystore.backend.controller;

import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.review.response.ReviewResponseDto;
import com.quochuystore.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/reviews")
@RequiredArgsConstructor
@Slf4j
public class AdminReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<PageResponseDto<ReviewResponseDto>> getAdminReviews(
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Boolean hasImage,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("REST request by ADMIN to get reviews. rating: {}, productId: {}, hasImage: {}, search: {}, page: {}, size: {}",
                rating, productId, hasImage, search, page, size);
        PageResponseDto<ReviewResponseDto> response = reviewService.getAdminReviews(rating, productId, hasImage, search, page, size);
        return ResponseEntity.ok(response);
    }
}
