package com.quochuystore.backend.controller;

import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.order.request.OrderStatusUpdateRequestDto;
import com.quochuystore.backend.dto.order.response.OrderResponseDto;
import com.quochuystore.backend.entity.enums.OrderStatus;
import com.quochuystore.backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/admin/orders")
@RequiredArgsConstructor
@Slf4j
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<PageResponseDto<OrderResponseDto>> getAdminOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("REST request by ADMIN to search orders. status: {}, userId: {}", status, userId);
        return ResponseEntity.ok(orderService.getAdminOrders(status, userId, page, size));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponseDto> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequestDto request) {

        log.info("REST request by ADMIN to update order status. id: {}, newStatus: {}", id, request.getStatus());
        return ResponseEntity.ok(orderService.updateOrderStatus(id, request.getStatus()));
    }
}
