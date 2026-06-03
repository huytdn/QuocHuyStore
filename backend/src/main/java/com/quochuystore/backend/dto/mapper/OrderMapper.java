package com.quochuystore.backend.dto.mapper;

import com.quochuystore.backend.dto.order.response.OrderItemResponseDto;
import com.quochuystore.backend.dto.order.response.OrderItemTrackingDto;
import com.quochuystore.backend.dto.order.response.OrderResponseDto;
import com.quochuystore.backend.dto.order.response.OrderTrackingResponseDto;
import com.quochuystore.backend.entity.Order;
import com.quochuystore.backend.entity.OrderItem;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public final class OrderMapper {

    private OrderMapper() {
    }

    public static OrderResponseDto toOrderResponseDto(Order order) {
        if (order == null) {
            return null;
        }

        List<OrderItemResponseDto> itemDtos = Collections.emptyList();
        if (order.getOrderItems() != null) {
            itemDtos = order.getOrderItems().stream()
                    .map(OrderMapper::toOrderItemResponseDto)
                    .collect(Collectors.toList());
        }

        return OrderResponseDto.builder()
                .orderId(order.getId())
                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .shippingAddressDetail(order.getShippingAddressDetail())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .createdAt(order.getCreatedAt())
                .items(itemDtos)
                .build();
    }

    public static OrderItemResponseDto toOrderItemResponseDto(OrderItem item) {
        if (item == null) {
            return null;
        }

        return OrderItemResponseDto.builder()
                .productName(item.getProductName())
                .colorName(item.getColorName())
                .sizeName(item.getSizeName())
                .quantity(item.getQuantity())
                .priceAtPurchase(item.getPriceAtPurchase())
                .build();
    }

    public static OrderTrackingResponseDto toOrderTrackingResponseDto(Order order) {
        if (order == null) {
            return null;
        }

        List<OrderItemTrackingDto> itemDtos = Collections.emptyList();
        if (order.getOrderItems() != null) {
            itemDtos = order.getOrderItems().stream()
                    .map(OrderMapper::toOrderItemTrackingDto)
                    .collect(Collectors.toList());
        }

        return OrderTrackingResponseDto.builder()
                .createdAt(order.getCreatedAt())
                .status(order.getStatus())
                .receiverName(order.getReceiverName())
                .items(itemDtos)
                .build();
    }

    public static OrderItemTrackingDto toOrderItemTrackingDto(OrderItem item) {
        if (item == null) {
            return null;
        }

        return OrderItemTrackingDto.builder()
                .productName(item.getProductName())
                .quantity(item.getQuantity())
                .build();
    }
}
