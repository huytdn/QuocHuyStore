package com.quochuystore.backend.service;

import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.dashboard.request.DashboardTimeRange;
import com.quochuystore.backend.dto.dashboard.response.*;
import org.springframework.data.domain.Pageable;

import java.time.OffsetDateTime;
import java.util.List;

public interface AdminDashboardService {

    DashboardKpiResponseDto getKpis(DashboardTimeRange range, OffsetDateTime from, OffsetDateTime to);

    DashboardRevenueChartResponseDto getRevenueChart(DashboardTimeRange range, OffsetDateTime from, OffsetDateTime to);

    DashboardOrderAnalyticsResponseDto getOrderAnalytics(DashboardTimeRange range, OffsetDateTime from, OffsetDateTime to);

    List<DashboardTopProductResponseDto> getTopSellingProducts(int limit, DashboardTimeRange range, OffsetDateTime from, OffsetDateTime to);

    List<DashboardCategoryRevenueResponseDto> getCategoryRevenue(DashboardTimeRange range, OffsetDateTime from, OffsetDateTime to);

    PageResponseDto<DashboardLowStockItemDto> getLowStockVariations(int threshold, Pageable pageable);
}
