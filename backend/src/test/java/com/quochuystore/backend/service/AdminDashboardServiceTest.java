package com.quochuystore.backend.service;

import tools.jackson.databind.ObjectMapper;
import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.dashboard.request.DashboardTimeRange;
import com.quochuystore.backend.dto.dashboard.response.*;
import com.quochuystore.backend.entity.Category;
import com.quochuystore.backend.entity.Product;
import com.quochuystore.backend.entity.ProductColor;
import com.quochuystore.backend.entity.ProductVariation;
import com.quochuystore.backend.entity.enums.OrderStatus;
import com.quochuystore.backend.entity.enums.PaymentMethod;
import com.quochuystore.backend.repository.OrderItemRepository;
import com.quochuystore.backend.repository.OrderRepository;
import com.quochuystore.backend.repository.ProductVariationRepository;
import com.quochuystore.backend.service.impl.AdminDashboardServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminDashboardServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private ProductVariationRepository productVariationRepository;

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private AdminDashboardServiceImpl dashboardService;

    @BeforeEach
    void setUp() {
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        lenient().when(valueOperations.get(anyString())).thenReturn(null); // Force cache miss for testing logic
    }

    @Test
    void testGetKpis_CalculatesGrowthRatesCorrectly() {
        OrderRepository.OrderKpiProjection currentKpi = mock(OrderRepository.OrderKpiProjection.class);
        when(currentKpi.getTotalRevenue()).thenReturn(BigDecimal.valueOf(15000000));
        when(currentKpi.getTotalOrders()).thenReturn(30L);

        OrderRepository.OrderKpiProjection prevKpi = mock(OrderRepository.OrderKpiProjection.class);
        when(prevKpi.getTotalRevenue()).thenReturn(BigDecimal.valueOf(10000000));
        when(prevKpi.getTotalOrders()).thenReturn(20L);

        when(orderRepository.getKpiStatsBetween(any(), any())).thenReturn(currentKpi, prevKpi);
        when(orderRepository.countByStatusIn(any())).thenReturn(5L);
        when(productVariationRepository.countLowStockVariations(5)).thenReturn(3L);

        DashboardKpiResponseDto kpi = dashboardService.getKpis(DashboardTimeRange.TODAY, null, null);

        assertNotNull(kpi);
        assertEquals(BigDecimal.valueOf(15000000), kpi.getTotalRevenue());
        assertEquals(30L, kpi.getTotalOrders());
        assertEquals(50.0, kpi.getRevenueGrowthRate()); // (15 - 10) / 10 * 100 = +50%
        assertEquals(50.0, kpi.getOrdersGrowthRate());  // (30 - 20) / 20 * 100 = +50%
        assertEquals(5L, kpi.getActionRequiredOrders());
        assertEquals(3L, kpi.getLowStockCount());
    }

    @Test
    void testGetRevenueChart_CalculatesAovAndPaymentMap() {
        OrderRepository.TimeSeriesPointProjection point = mock(OrderRepository.TimeSeriesPointProjection.class);
        when(point.getBucket()).thenReturn("2026-08-25");
        when(point.getRevenue()).thenReturn(BigDecimal.valueOf(2000000));
        when(point.getOrderCount()).thenReturn(4L);

        when(orderRepository.getTimeSeriesRevenueBetween(anyString(), anyString(), any(), any()))
                .thenReturn(List.of(point));

        OrderRepository.PaymentMethodStatProjection codStat = mock(OrderRepository.PaymentMethodStatProjection.class);
        when(codStat.getPaymentMethod()).thenReturn("COD");
        when(codStat.getRevenue()).thenReturn(BigDecimal.valueOf(1200000));
        when(codStat.getOrderCount()).thenReturn(2L);

        OrderRepository.PaymentMethodStatProjection onlineStat = mock(OrderRepository.PaymentMethodStatProjection.class);
        when(onlineStat.getPaymentMethod()).thenReturn("ONLINE_PAYMENT");
        when(onlineStat.getRevenue()).thenReturn(BigDecimal.valueOf(800000));
        when(onlineStat.getOrderCount()).thenReturn(2L);

        when(orderRepository.getPaymentMethodStatsBetween(any(), any()))
                .thenReturn(List.of(codStat, onlineStat));

        DashboardRevenueChartResponseDto chart = dashboardService.getRevenueChart(DashboardTimeRange.TODAY, null, null);

        assertNotNull(chart);
        assertEquals(1, chart.getTimeSeries().size());
        assertEquals(BigDecimal.valueOf(500000.00).setScale(2), chart.getAverageOrderValue()); // 2000000 / 4 = 500000.00
        assertEquals(BigDecimal.valueOf(1200000), chart.getPaymentMethodDistribution().get(PaymentMethod.COD).getRevenue());
        assertEquals(BigDecimal.valueOf(800000), chart.getPaymentMethodDistribution().get(PaymentMethod.ONLINE_PAYMENT).getRevenue());
    }

    @Test
    void testGetOrderAnalytics_SuccessAndCancellationRates() {
        OrderRepository.OrderStatusStatProjection deliveredStat = mock(OrderRepository.OrderStatusStatProjection.class);
        when(deliveredStat.getStatus()).thenReturn("DELIVERED");
        when(deliveredStat.getCount()).thenReturn(8L);
        when(deliveredStat.getDiscountSum()).thenReturn(BigDecimal.valueOf(50000));

        OrderRepository.OrderStatusStatProjection cancelStat = mock(OrderRepository.OrderStatusStatProjection.class);
        when(cancelStat.getStatus()).thenReturn("CANCELED");
        when(cancelStat.getCount()).thenReturn(2L);
        when(cancelStat.getDiscountSum()).thenReturn(BigDecimal.ZERO);

        when(orderRepository.getOrderStatusStatsBetween(any(), any()))
                .thenReturn(List.of(deliveredStat, cancelStat));

        DashboardOrderAnalyticsResponseDto result = dashboardService.getOrderAnalytics(DashboardTimeRange.THIS_MONTH, null, null);

        assertNotNull(result);
        assertEquals(80.0, result.getDeliverySuccessRate()); // 8 / 10 = 80.0%
        assertEquals(20.0, result.getCancelOrFailedRate());  // 2 / 10 = 20.0%
        assertEquals(BigDecimal.valueOf(50000), result.getTotalDiscountGiven());
    }

    @Test
    void testGetTopSellingProducts_Success() {
        OrderItemRepository.TopProductProjection p = mock(OrderItemRepository.TopProductProjection.class);
        when(p.getProductId()).thenReturn(1L);
        when(p.getProductName()).thenReturn("Áo Thun");
        when(p.getSlug()).thenReturn("ao-thun");
        when(p.getThumbnailUrl()).thenReturn("https://img.jpg");
        when(p.getTotalQuantitySold()).thenReturn(50L);
        when(p.getTotalRevenue()).thenReturn(BigDecimal.valueOf(10000000));

        when(orderItemRepository.findTopSellingProductsBetween(any(), any(), eq(5)))
                .thenReturn(List.of(p));

        List<DashboardTopProductResponseDto> topProducts = dashboardService.getTopSellingProducts(5, DashboardTimeRange.THIS_MONTH, null, null);

        assertEquals(1, topProducts.size());
        assertEquals("Áo Thun", topProducts.getFirst().getProductName());
        assertEquals(50L, topProducts.getFirst().getTotalQuantitySold());
    }

    @Test
    void testGetLowStockVariations_MapsAvoidsNPlusOne() {
        Product product = Product.builder().id(10L).name("Áo Polo").build();
        ProductColor color = ProductColor.builder().id(20L).colorName("Trắng").imageUrl("https://polo.jpg").product(product).build();
        ProductVariation variation = ProductVariation.builder()
                .id(30L)
                .productColor(color)
                .size("XL")
                .stockQuantity(2)
                .unitPrice(BigDecimal.valueOf(250000))
                .build();

        Pageable pageable = PageRequest.of(0, 10);
        when(productVariationRepository.findLowStockVariationsWithDetails(5, pageable))
                .thenReturn(new PageImpl<>(List.of(variation), pageable, 1));

        PageResponseDto<DashboardLowStockItemDto> result = dashboardService.getLowStockVariations(5, pageable);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        DashboardLowStockItemDto item = result.getContent().getFirst();
        assertEquals(30L, item.getVariationId());
        assertEquals("Áo Polo", item.getProductName());
        assertEquals("Trắng", item.getColorName());
        assertEquals(2, item.getStockQuantity());
    }
}
