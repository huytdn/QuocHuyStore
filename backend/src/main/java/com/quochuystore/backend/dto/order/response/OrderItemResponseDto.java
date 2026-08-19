package com.quochuystore.backend.dto.order.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponseDto {
    private UUID orderItemId;
    private String productName;
    private String colorName;
    private String sizeName;
    private String imageUrl;
    private Integer quantity;
    private BigDecimal priceAtPurchase;
}
