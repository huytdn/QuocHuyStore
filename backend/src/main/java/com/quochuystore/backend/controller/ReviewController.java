package com.quochuystore.backend.controller;

import tools.jackson.databind.ObjectMapper;
import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.review.request.ReviewCreateRequestDto;
import com.quochuystore.backend.dto.review.response.ReviewResponseDto;
import com.quochuystore.backend.security.UserPrincipal;
import com.quochuystore.backend.service.ReviewService;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

@RestController
@RequiredArgsConstructor
@Slf4j
public class ReviewController {

    private final ReviewService reviewService;
    private final ObjectMapper objectMapper;
    private final Validator validator;

    @GetMapping("/products/{slug}/reviews")
    public ResponseEntity<PageResponseDto<ReviewResponseDto>> getProductReviews(
            @PathVariable String slug,
            @RequestParam(required = false) Integer rating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("REST request to get reviews for product slug: {}, rating: {}, page: {}, size: {}",
                slug, rating, page, size);
        PageResponseDto<ReviewResponseDto> response = reviewService.getProductReviews(slug, rating, page, size);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/reviews", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ReviewResponseDto> createReview(
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart("metadata") String metadataJson,
            @AuthenticationPrincipal UserPrincipal principal) {

        log.info("REST request to create/update review by userId: {} with metadata: {}", principal.getId(), metadataJson);
        ReviewCreateRequestDto request;
        try {
            request = objectMapper.readValue(metadataJson, ReviewCreateRequestDto.class);
        } catch (Exception e) {
            log.error("Failed to parse review metadata JSON", e);
            throw new IllegalArgumentException("Invalid review metadata JSON structure");
        }

        Set<ConstraintViolation<ReviewCreateRequestDto>> violations = validator.validate(request);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }

        ReviewResponseDto response = reviewService.upsertReview(principal.getId(), request, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
