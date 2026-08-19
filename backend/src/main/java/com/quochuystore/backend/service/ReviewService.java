package com.quochuystore.backend.service;

import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.review.request.ReviewCreateRequestDto;
import com.quochuystore.backend.dto.review.response.ReviewResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface ReviewService {

    PageResponseDto<ReviewResponseDto> getProductReviews(String slug, Integer rating, int page, int size);

    ReviewResponseDto upsertReview(UUID userId, ReviewCreateRequestDto request, MultipartFile file);
}
