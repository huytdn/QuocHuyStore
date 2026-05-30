package com.quochuystore.backend.dto.product.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductListResponseDto {
    private Long id;
    private String name;
    private String slug;
    private String thumbnailUrl;
    private String thumbnailPublicId;
    private BigDecimal minPrice;
    private String categoryName;
    private Double averageStar;
    private Integer reviewCount;
}
