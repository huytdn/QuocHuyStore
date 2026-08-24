package com.quochuystore.backend.dto.dashboard.response;

import com.quochuystore.backend.entity.enums.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardRevenueChartResponseDto {
    private List<DashboardTimeSeriesPointDto> timeSeries;
    private BigDecimal averageOrderValue;
    private Map<PaymentMethod, PaymentMethodStatDto> paymentMethodDistribution;
}
