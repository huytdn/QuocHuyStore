package com.quochuystore.backend.dto.product.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LikeToggleResponseDto {
    private Long productId;
    private Boolean isLiked;
    private String message;
}
