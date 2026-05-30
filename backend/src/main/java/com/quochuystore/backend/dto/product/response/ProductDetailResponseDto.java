package com.quochuystore.backend.dto.product.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDetailResponseDto {
    private Long id;
    private String name;
    private String slug;
    private String thumbnailUrl;
    private String thumbnailPublicId;
    private String description;
    private String categoryName;
    private Double averageStar;
    private Integer reviewCount;
    private Integer feedbackCount;
    private List<ProductColorResponseDto> colors;
}
