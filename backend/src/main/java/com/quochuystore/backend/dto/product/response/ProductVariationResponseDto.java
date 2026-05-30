package com.quochuystore.backend.dto.product.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariationResponseDto {
    private Long variationId;
    private String size;
    private BigDecimal unitPrice;
    private Integer stockQuantity;
    private Boolean isActive;
}
