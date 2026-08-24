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
public class DashboardTopProductResponseDto {
    private Long productId;
    private String productName;
    private String slug;
    private String thumbnailUrl;
    private Long totalQuantitySold;
    private BigDecimal totalRevenue;
}
