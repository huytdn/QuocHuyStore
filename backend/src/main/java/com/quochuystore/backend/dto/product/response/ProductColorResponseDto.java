package com.quochuystore.backend.dto.product.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductColorResponseDto {
    private Long colorId;
    private String colorName;
    private String imageUrl;
    private String imagePublicId;
    private List<ProductVariationResponseDto> variations;
}
