package com.quochuystore.backend.dto.dashboard.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardLowStockItemDto {
    private Long variationId;
    private Long productId;
    private String productName;
    private String colorName;
    private String size;
    private Integer stockQuantity;
    private BigDecimal unitPrice;
    private String imageUrl;
}
