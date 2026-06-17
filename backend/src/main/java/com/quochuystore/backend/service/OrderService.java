package com.quochuystore.backend.service;

import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.order.request.OrderCreateRequestDto;
import com.quochuystore.backend.dto.order.response.OrderResponseDto;
import com.quochuystore.backend.dto.order.response.OrderTrackingResponseDto;
import com.quochuystore.backend.entity.Order;
import com.quochuystore.backend.entity.enums.OrderStatus;

import java.util.UUID;

public interface OrderService {

    OrderResponseDto createOrder(UUID userId, OrderCreateRequestDto request);

    PageResponseDto<OrderResponseDto> getOrders(UUID userId, OrderStatus status, int page, int size);

    OrderResponseDto getOrderById(Long id, UUID userId);

    OrderResponseDto cancelOrder(Long id, UUID userId);

    PageResponseDto<OrderTrackingResponseDto> trackOrders(String phone, String name, int page, int size);

    PageResponseDto<OrderResponseDto> getAdminOrders(OrderStatus status, UUID userId, int page, int size);

    OrderResponseDto updateOrderStatus(Long id, OrderStatus status);

    void updateOrderStatusByPayOSCode(Long orderId, boolean success);

    void restoreStockForOrder(Order order);

    void cancelOrderOnPaymentLinkFailure(Long orderId);

    boolean cancelAndRestoreStock(Long orderId);
}
