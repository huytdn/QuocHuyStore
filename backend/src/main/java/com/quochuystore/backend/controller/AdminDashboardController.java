package com.quochuystore.backend.controller;

import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.dashboard.request.DashboardTimeRange;
import com.quochuystore.backend.dto.dashboard.response.*;
import com.quochuystore.backend.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/admin/dashboard")
@RequiredArgsConstructor
@Slf4j
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    @GetMapping("/kpis")
    public ResponseEntity<DashboardKpiResponseDto> getKpis(
            @RequestParam(required = false, defaultValue = "TODAY") DashboardTimeRange range,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to) {

        log.info("REST request by ADMIN for Dashboard KPIs. range: {}, from: {}, to: {}", range, from, to);
        return ResponseEntity.ok(dashboardService.getKpis(range, from, to));
    }

    @GetMapping("/revenue-chart")
    public ResponseEntity<DashboardRevenueChartResponseDto> getRevenueChart(
            @RequestParam(required = false, defaultValue = "TODAY") DashboardTimeRange range,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to) {

        log.info("REST request by ADMIN for Dashboard Revenue Chart. range: {}, from: {}, to: {}", range, from, to);
        return ResponseEntity.ok(dashboardService.getRevenueChart(range, from, to));
    }

    @GetMapping("/order-analytics")
    public ResponseEntity<DashboardOrderAnalyticsResponseDto> getOrderAnalytics(
            @RequestParam(required = false, defaultValue = "TODAY") DashboardTimeRange range,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to) {

        log.info("REST request by ADMIN for Dashboard Order Analytics. range: {}, from: {}, to: {}", range, from, to);
        return ResponseEntity.ok(dashboardService.getOrderAnalytics(range, from, to));
    }

    @GetMapping("/top-products")
    public ResponseEntity<List<DashboardTopProductResponseDto>> getTopSellingProducts(
            @RequestParam(defaultValue = "5") int limit,
            @RequestParam(required = false, defaultValue = "TODAY") DashboardTimeRange range,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to) {

        log.info("REST request by ADMIN for Dashboard Top Selling Products. limit: {}, range: {}, from: {}, to: {}", limit, range, from, to);
        return ResponseEntity.ok(dashboardService.getTopSellingProducts(limit, range, from, to));
    }

    @GetMapping("/category-revenue")
    public ResponseEntity<List<DashboardCategoryRevenueResponseDto>> getCategoryRevenue(
            @RequestParam(required = false, defaultValue = "TODAY") DashboardTimeRange range,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to) {

        log.info("REST request by ADMIN for Dashboard Category Revenue. range: {}, from: {}, to: {}", range, from, to);
        return ResponseEntity.ok(dashboardService.getCategoryRevenue(range, from, to));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<PageResponseDto<DashboardLowStockItemDto>> getLowStockVariations(
            @RequestParam(defaultValue = "5") int threshold,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("REST request by ADMIN for Dashboard Low Stock items. threshold: {}, page: {}, size: {}", threshold, page, size);
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(dashboardService.getLowStockVariations(threshold, pageable));
    }
}
