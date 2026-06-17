package com.quochuystore.backend.dto.order.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponseDto {
    private UUID cartItemId;
    private Long variationId;
    private String productName;
    private String colorName;
    private String size;
    private String imageUrl;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal totalItemPrice;
}
