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
public class DashboardKpiResponseDto {
    private BigDecimal totalRevenue;
    private Double revenueGrowthRate;
    private Long totalOrders;
    private Double ordersGrowthRate;
    private Long actionRequiredOrders;
    private Long lowStockCount;
}
