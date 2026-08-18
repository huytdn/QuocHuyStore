package com.quochuystore.backend.dto.order.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponseDto {
    private String productName;
    private String colorName;
    private String sizeName;
    private String imageUrl;
    private Integer quantity;
    private BigDecimal priceAtPurchase;
}
