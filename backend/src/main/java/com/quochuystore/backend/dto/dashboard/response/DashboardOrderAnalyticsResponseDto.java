package com.quochuystore.backend.dto.dashboard.response;

import com.quochuystore.backend.entity.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardOrderAnalyticsResponseDto {
    private Map<OrderStatus, Long> statusCounts;
    private Double deliverySuccessRate;
    private Double cancelOrFailedRate;
    private BigDecimal totalDiscountGiven;
}
