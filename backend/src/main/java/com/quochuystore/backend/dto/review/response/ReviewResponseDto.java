package com.quochuystore.backend.dto.review.response;

import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponseDto {

    private Long id;
    private UUID userId;
    private String userDisplayName;
    private Integer rating;
    private String variationName;
    private String content;
    private String imageUrl;
    private OffsetDateTime createdAt;
}
