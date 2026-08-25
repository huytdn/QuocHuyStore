package com.quochuystore.backend.service.impl;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import com.quochuystore.backend.config.CacheKeyConstants;
import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.dashboard.request.DashboardTimeRange;
import com.quochuystore.backend.dto.dashboard.response.*;
import com.quochuystore.backend.entity.ProductColor;
import com.quochuystore.backend.entity.ProductVariation;
import com.quochuystore.backend.entity.enums.OrderStatus;
import com.quochuystore.backend.entity.enums.PaymentMethod;
import com.quochuystore.backend.repository.OrderItemRepository;
import com.quochuystore.backend.repository.OrderRepository;
import com.quochuystore.backend.repository.ProductVariationRepository;
import com.quochuystore.backend.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductVariationRepository productVariationRepository;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    private static final List<OrderStatus> ACTION_REQUIRED_STATUSES = List.of(
            OrderStatus.PENDING_APPROVAL,
            OrderStatus.AWAITING_PICKUP
    );

    @Override
    @Transactional(readOnly = true)
    public DashboardKpiResponseDto getKpis(DashboardTimeRange range, OffsetDateTime from, OffsetDateTime to) {
        TimeWindow window = resolveTimeWindow(range, from, to);
        String cacheKey = CacheKeyConstants.DASHBOARD_KPI_PREFIX + window.cacheKeySuffix();

        // 1. Try Redis Cache
        try {
            String cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                log.info("Cache hit for Dashboard KPIs: {}", cacheKey);
                return objectMapper.readValue(cached, DashboardKpiResponseDto.class);
            }
        } catch (Exception e) {
            log.error("Failed to read Dashboard KPIs cache", e);
        }

        // 2. Query Current Period
        OrderRepository.OrderKpiProjection currentKpi = orderRepository.getKpiStatsBetween(window.from(), window.to());
        BigDecimal currentRevenue = currentKpi != null && currentKpi.getTotalRevenue() != null
                ? currentKpi.getTotalRevenue() : BigDecimal.ZERO;
        Long currentOrders = currentKpi != null && currentKpi.getTotalOrders() != null
                ? currentKpi.getTotalOrders() : 0L;

        // 3. Query Previous Period for Growth Rate
        OrderRepository.OrderKpiProjection prevKpi = orderRepository.getKpiStatsBetween(window.prevFrom(), window.prevTo());
        BigDecimal prevRevenue = prevKpi != null && prevKpi.getTotalRevenue() != null
                ? prevKpi.getTotalRevenue() : BigDecimal.ZERO;
        Long prevOrders = prevKpi != null && prevKpi.getTotalOrders() != null
                ? prevKpi.getTotalOrders() : 0L;

        Double revenueGrowthRate = calculateGrowthRate(currentRevenue.doubleValue(), prevRevenue.doubleValue());
        Double ordersGrowthRate = calculateGrowthRate(currentOrders.doubleValue(), prevOrders.doubleValue());

        // 4. Action Required Orders & Low Stock Count (Real-time snapshots)
        long actionRequiredOrders = orderRepository.countByStatusIn(ACTION_REQUIRED_STATUSES);
        long lowStockCount = productVariationRepository.countLowStockVariations(5);

        DashboardKpiResponseDto response = DashboardKpiResponseDto.builder()
                .totalRevenue(currentRevenue)
                .revenueGrowthRate(revenueGrowthRate)
                .totalOrders(currentOrders)
                .ordersGrowthRate(ordersGrowthRate)
                .actionRequiredOrders(actionRequiredOrders)
                .lowStockCount(lowStockCount)
                .build();

        // 5. Populate Cache
        try {
            String json = objectMapper.writeValueAsString(response);
            redisTemplate.opsForValue().set(cacheKey, json, CacheKeyConstants.DASHBOARD_KPI_TTL_MINUTES, TimeUnit.MINUTES);
        } catch (Exception e) {
            log.error("Failed to cache Dashboard KPIs", e);
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardRevenueChartResponseDto getRevenueChart(DashboardTimeRange range, OffsetDateTime from, OffsetDateTime to) {
        TimeWindow window = resolveTimeWindow(range, from, to);
        String cacheKey = CacheKeyConstants.DASHBOARD_REVENUE_PREFIX + window.cacheKeySuffix();

        try {
            String cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                log.info("Cache hit for Dashboard Revenue Chart: {}", cacheKey);
                return objectMapper.readValue(cached, DashboardRevenueChartResponseDto.class);
            }
        } catch (Exception e) {
            log.error("Failed to read Dashboard Revenue Chart cache", e);
        }

        // 1. Time Series Points
        String bucketUnit = resolveBucketUnit(range != null ? range : DashboardTimeRange.TODAY);
        String dateFormat = resolveDateFormat(bucketUnit);

        List<OrderRepository.TimeSeriesPointProjection> points = orderRepository.getTimeSeriesRevenueBetween(
                bucketUnit, dateFormat, window.from(), window.to());

        List<DashboardTimeSeriesPointDto> timeSeries = new ArrayList<>();
        BigDecimal totalDeliveredRevenue = BigDecimal.ZERO;
        long totalDeliveredOrders = 0;

        if (points != null) {
            for (OrderRepository.TimeSeriesPointProjection p : points) {
                BigDecimal rev = p.getRevenue() != null ? p.getRevenue() : BigDecimal.ZERO;
                Long cnt = p.getOrderCount() != null ? p.getOrderCount() : 0L;
                timeSeries.add(DashboardTimeSeriesPointDto.builder()
                        .label(p.getBucket())
                        .revenue(rev)
                        .orderCount(cnt)
                        .build());
                totalDeliveredRevenue = totalDeliveredRevenue.add(rev);
                if (rev.compareTo(BigDecimal.ZERO) > 0) {
                    totalDeliveredOrders += cnt;
                }
            }
        }

        // 2. Average Order Value (AOV)
        BigDecimal averageOrderValue = totalDeliveredOrders > 0
                ? totalDeliveredRevenue.divide(BigDecimal.valueOf(totalDeliveredOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // 3. Payment Method Distribution
        List<OrderRepository.PaymentMethodStatProjection> paymentStats = orderRepository.getPaymentMethodStatsBetween(
                window.from(), window.to());

        Map<PaymentMethod, PaymentMethodStatDto> paymentMap = new EnumMap<>(PaymentMethod.class);
        // Initialize with zeros for all enum values
        for (PaymentMethod pm : PaymentMethod.values()) {
            paymentMap.put(pm, new PaymentMethodStatDto(BigDecimal.ZERO, 0L));
        }

        if (paymentStats != null) {
            for (OrderRepository.PaymentMethodStatProjection ps : paymentStats) {
                try {
                    PaymentMethod pm = PaymentMethod.valueOf(ps.getPaymentMethod());
                    paymentMap.put(pm, new PaymentMethodStatDto(
                            ps.getRevenue() != null ? ps.getRevenue() : BigDecimal.ZERO,
                            ps.getOrderCount() != null ? ps.getOrderCount() : 0L
                    ));
                } catch (Exception ignored) {
                }
            }
        }

        DashboardRevenueChartResponseDto response = DashboardRevenueChartResponseDto.builder()
                .timeSeries(timeSeries)
                .averageOrderValue(averageOrderValue)
                .paymentMethodDistribution(paymentMap)
                .build();

        try {
            String json = objectMapper.writeValueAsString(response);
            redisTemplate.opsForValue().set(cacheKey, json, CacheKeyConstants.DASHBOARD_REVENUE_TTL_MINUTES, TimeUnit.MINUTES);
        } catch (Exception e) {
            log.error("Failed to cache Dashboard Revenue Chart", e);
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardOrderAnalyticsResponseDto getOrderAnalytics(DashboardTimeRange range, OffsetDateTime from, OffsetDateTime to) {
        TimeWindow window = resolveTimeWindow(range, from, to);
        String cacheKey = CacheKeyConstants.DASHBOARD_ORDER_ANALYTICS_PREFIX + window.cacheKeySuffix();

        try {
            String cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                log.info("Cache hit for Dashboard Order Analytics: {}", cacheKey);
                return objectMapper.readValue(cached, DashboardOrderAnalyticsResponseDto.class);
            }
        } catch (Exception e) {
            log.error("Failed to read Dashboard Order Analytics cache", e);
        }

        List<OrderRepository.OrderStatusStatProjection> stats = orderRepository.getOrderStatusStatsBetween(
                window.from(), window.to());

        Map<OrderStatus, Long> statusCounts = new EnumMap<>(OrderStatus.class);
        for (OrderStatus os : OrderStatus.values()) {
            statusCounts.put(os, 0L);
        }

        long totalOrders = 0;
        long deliveredCount = 0;
        long cancelOrFailedCount = 0;
        BigDecimal totalDiscount = BigDecimal.ZERO;

        if (stats != null) {
            for (OrderRepository.OrderStatusStatProjection s : stats) {
                try {
                    OrderStatus os = OrderStatus.valueOf(s.getStatus());
                    long cnt = s.getCount() != null ? s.getCount() : 0L;
                    statusCounts.put(os, cnt);
                    totalOrders += cnt;

                    if (os == OrderStatus.DELIVERED) {
                        deliveredCount += cnt;
                    } else if (os == OrderStatus.CANCELED || os == OrderStatus.DELIVERY_FAILED) {
                        cancelOrFailedCount += cnt;
                    }

                    if (s.getDiscountSum() != null) {
                        totalDiscount = totalDiscount.add(s.getDiscountSum());
                    }
                } catch (Exception ignored) {
                }
            }
        }

        double successRate = totalOrders > 0
                ? BigDecimal.valueOf((double) deliveredCount / totalOrders * 100).setScale(2, RoundingMode.HALF_UP).doubleValue()
                : 0.0;
        double failRate = totalOrders > 0
                ? BigDecimal.valueOf((double) cancelOrFailedCount / totalOrders * 100).setScale(2, RoundingMode.HALF_UP).doubleValue()
                : 0.0;

        DashboardOrderAnalyticsResponseDto response = DashboardOrderAnalyticsResponseDto.builder()
                .statusCounts(statusCounts)
                .deliverySuccessRate(successRate)
                .cancelOrFailedRate(failRate)
                .totalDiscountGiven(totalDiscount)
                .build();

        try {
            String json = objectMapper.writeValueAsString(response);
            redisTemplate.opsForValue().set(cacheKey, json, CacheKeyConstants.DASHBOARD_ORDER_ANALYTICS_TTL_MINUTES, TimeUnit.MINUTES);
        } catch (Exception e) {
            log.error("Failed to cache Dashboard Order Analytics", e);
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DashboardTopProductResponseDto> getTopSellingProducts(int limit, DashboardTimeRange range, OffsetDateTime from, OffsetDateTime to) {
        int safeLimit = Math.max(1, Math.min(limit, 50));
        TimeWindow window = resolveTimeWindow(range, from, to);
        String cacheKey = CacheKeyConstants.DASHBOARD_TOP_PRODUCTS_PREFIX + safeLimit + ":" + window.cacheKeySuffix();

        try {
            String cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                log.info("Cache hit for Dashboard Top Products: {}", cacheKey);
                return objectMapper.readValue(cached, new TypeReference<List<DashboardTopProductResponseDto>>() {});
            }
        } catch (Exception e) {
            log.error("Failed to read Dashboard Top Products cache", e);
        }

        List<OrderItemRepository.TopProductProjection> projs = orderItemRepository.findTopSellingProductsBetween(
                window.from(), window.to(), safeLimit);

        List<DashboardTopProductResponseDto> response = new ArrayList<>();
        if (projs != null) {
            for (OrderItemRepository.TopProductProjection p : projs) {
                response.add(DashboardTopProductResponseDto.builder()
                        .productId(p.getProductId())
                        .productName(p.getProductName())
                        .slug(p.getSlug())
                        .thumbnailUrl(p.getThumbnailUrl())
                        .totalQuantitySold(p.getTotalQuantitySold() != null ? p.getTotalQuantitySold() : 0L)
                        .totalRevenue(p.getTotalRevenue() != null ? p.getTotalRevenue() : BigDecimal.ZERO)
                        .build());
            }
        }

        try {
            String json = objectMapper.writeValueAsString(response);
            redisTemplate.opsForValue().set(cacheKey, json, CacheKeyConstants.DASHBOARD_TOP_PRODUCTS_TTL_MINUTES, TimeUnit.MINUTES);
        } catch (Exception e) {
            log.error("Failed to cache Dashboard Top Products", e);
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DashboardCategoryRevenueResponseDto> getCategoryRevenue(DashboardTimeRange range, OffsetDateTime from, OffsetDateTime to) {
        TimeWindow window = resolveTimeWindow(range, from, to);
        String cacheKey = CacheKeyConstants.DASHBOARD_CATEGORY_REVENUE_PREFIX + window.cacheKeySuffix();

        try {
            String cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                log.info("Cache hit for Dashboard Category Revenue: {}", cacheKey);
                return objectMapper.readValue(cached, new TypeReference<List<DashboardCategoryRevenueResponseDto>>() {});
            }
        } catch (Exception e) {
            log.error("Failed to read Dashboard Category Revenue cache", e);
        }

        List<OrderItemRepository.CategoryRevenueProjection> projs = orderItemRepository.findCategoryRevenueBetween(
                window.from(), window.to());

        BigDecimal totalRevenueAllCategories = BigDecimal.ZERO;
        if (projs != null) {
            for (OrderItemRepository.CategoryRevenueProjection p : projs) {
                if (p.getRevenue() != null) {
                    totalRevenueAllCategories = totalRevenueAllCategories.add(p.getRevenue());
                }
            }
        }

        List<DashboardCategoryRevenueResponseDto> response = new ArrayList<>();
        if (projs != null) {
            for (OrderItemRepository.CategoryRevenueProjection p : projs) {
                BigDecimal rev = p.getRevenue() != null ? p.getRevenue() : BigDecimal.ZERO;
                double percentage = 0.0;
                if (totalRevenueAllCategories.compareTo(BigDecimal.ZERO) > 0) {
                    percentage = rev.divide(totalRevenueAllCategories, 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100))
                            .setScale(2, RoundingMode.HALF_UP)
                            .doubleValue();
                }
                response.add(DashboardCategoryRevenueResponseDto.builder()
                        .categoryId(p.getCategoryId())
                        .categoryName(p.getCategoryName())
                        .revenue(rev)
                        .percentage(percentage)
                        .build());
            }
        }

        try {
            String json = objectMapper.writeValueAsString(response);
            redisTemplate.opsForValue().set(cacheKey, json, CacheKeyConstants.DASHBOARD_CATEGORY_REVENUE_TTL_MINUTES, TimeUnit.MINUTES);
        } catch (Exception e) {
            log.error("Failed to cache Dashboard Category Revenue", e);
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDto<DashboardLowStockItemDto> getLowStockVariations(int threshold, Pageable pageable) {
        int safeThreshold = Math.max(0, threshold);
        String cacheKey = CacheKeyConstants.DASHBOARD_LOW_STOCK_PREFIX + safeThreshold + ":" + pageable.getPageNumber() + ":" + pageable.getPageSize();

        try {
            String cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                log.info("Cache hit for Dashboard Low Stock: {}", cacheKey);
                return objectMapper.readValue(cached, new TypeReference<PageResponseDto<DashboardLowStockItemDto>>() {});
            }
        } catch (Exception e) {
            log.error("Failed to read Dashboard Low Stock cache", e);
        }

        Page<ProductVariation> pageResult = productVariationRepository.findLowStockVariationsWithDetails(safeThreshold, pageable);

        List<DashboardLowStockItemDto> dtoList = pageResult.getContent().stream()
                .map(v -> {
                    ProductColor pc = v.getProductColor();
                    String productName = (pc != null && pc.getProduct() != null) ? pc.getProduct().getName() : "N/A";
                    Long productId = (pc != null && pc.getProduct() != null) ? pc.getProduct().getId() : null;
                    String colorName = pc != null ? pc.getColorName() : "N/A";
                    String imageUrl = pc != null ? pc.getImageUrl() : null;

                    return DashboardLowStockItemDto.builder()
                            .variationId(v.getId())
                            .productId(productId)
                            .productName(productName)
                            .colorName(colorName)
                            .size(v.getSize())
                            .stockQuantity(v.getStockQuantity())
                            .unitPrice(v.getUnitPrice())
                            .imageUrl(imageUrl)
                            .build();
                })
                .toList();

        PageResponseDto<DashboardLowStockItemDto> response = PageResponseDto.<DashboardLowStockItemDto>builder()
                .content(dtoList)
                .pageNo(pageResult.getNumber())
                .pageSize(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();

        try {
            String json = objectMapper.writeValueAsString(response);
            redisTemplate.opsForValue().set(cacheKey, json, CacheKeyConstants.DASHBOARD_LOW_STOCK_TTL_MINUTES, TimeUnit.MINUTES);
        } catch (Exception e) {
            log.error("Failed to cache Dashboard Low Stock", e);
        }

        return response;
    }

    // ==========================================
    // HELPER METHODS
    // ==========================================

    private record TimeWindow(OffsetDateTime from, OffsetDateTime to, OffsetDateTime prevFrom, OffsetDateTime prevTo) {
        String cacheKeySuffix() {
            return from.toEpochSecond() + ":" + to.toEpochSecond();
        }
    }

    private TimeWindow resolveTimeWindow(DashboardTimeRange range, OffsetDateTime from, OffsetDateTime to) {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        if (range == null) {
            range = DashboardTimeRange.TODAY;
        }

        OffsetDateTime currentFrom;
        OffsetDateTime currentTo = now;
        OffsetDateTime prevFrom;
        OffsetDateTime prevTo;

        switch (range) {
            case TODAY -> {
                currentFrom = now.truncatedTo(ChronoUnit.DAYS);
                prevFrom = currentFrom.minusDays(1);
                prevTo = currentFrom;
            }
            case THIS_WEEK -> {
                currentFrom = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).truncatedTo(ChronoUnit.DAYS);
                prevFrom = currentFrom.minusWeeks(1);
                prevTo = currentFrom;
            }
            case THIS_MONTH -> {
                currentFrom = now.with(TemporalAdjusters.firstDayOfMonth()).truncatedTo(ChronoUnit.DAYS);
                prevFrom = currentFrom.minusMonths(1);
                prevTo = currentFrom;
            }
            case THIS_QUARTER -> {
                int firstMonthOfQuarter = ((now.getMonthValue() - 1) / 3) * 3 + 1;
                currentFrom = now.withMonth(firstMonthOfQuarter).with(TemporalAdjusters.firstDayOfMonth()).truncatedTo(ChronoUnit.DAYS);
                prevFrom = currentFrom.minusMonths(3);
                prevTo = currentFrom;
            }
            case THIS_YEAR -> {
                currentFrom = now.with(TemporalAdjusters.firstDayOfYear()).truncatedTo(ChronoUnit.DAYS);
                prevFrom = currentFrom.minusYears(1);
                prevTo = currentFrom;
            }
            case CUSTOM -> {
                currentFrom = from != null ? from : now.minusDays(30);
                currentTo = to != null ? to : now;
                Duration duration = Duration.between(currentFrom, currentTo);
                prevTo = currentFrom;
                prevFrom = currentFrom.minus(duration);
            }
            default -> {
                currentFrom = now.truncatedTo(ChronoUnit.DAYS);
                prevFrom = currentFrom.minusDays(1);
                prevTo = currentFrom;
            }
        }

        return new TimeWindow(currentFrom, currentTo, prevFrom, prevTo);
    }

    private String resolveBucketUnit(DashboardTimeRange range) {
        return switch (range) {
            case TODAY -> "hour";
            case THIS_QUARTER, THIS_YEAR -> "month";
            default -> "day";
        };
    }

    private String resolveDateFormat(String bucketUnit) {
        return switch (bucketUnit) {
            case "hour" -> "YYYY-MM-DD HH24:00";
            case "month" -> "YYYY-MM";
            default -> "YYYY-MM-DD";
        };
    }

    private Double calculateGrowthRate(double current, double previous) {
        if (previous == 0.0) {
            return current > 0.0 ? 100.0 : 0.0;
        }
        double rate = ((current - previous) / previous) * 100.0;
        return BigDecimal.valueOf(rate).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
