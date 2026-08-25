package com.quochuystore.backend.dto.user.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAnalyticsSummaryDto {
    private Long totalCustomers;
    private Long newCustomers;
    private Double newCustomersGrowthRate;
    private Long payingCustomersCount;
    private Double buyerConversionRate;
    private Long repeatCustomersCount;
    private Double repeatCustomerRate;
    private BigDecimal arpu;
}
