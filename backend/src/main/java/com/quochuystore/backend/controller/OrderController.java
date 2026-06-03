package com.quochuystore.backend.controller;

import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.order.request.OrderCreateRequestDto;
import com.quochuystore.backend.dto.order.response.OrderResponseDto;
import com.quochuystore.backend.dto.order.response.OrderTrackingResponseDto;
import com.quochuystore.backend.entity.enums.OrderStatus;
import com.quochuystore.backend.entity.enums.PaymentMethod;
import com.quochuystore.backend.security.UserPrincipal;
import com.quochuystore.backend.service.OrderService;
import com.quochuystore.backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;
    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<OrderResponseDto> createOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody OrderCreateRequestDto request) {

        UUID userId = principal != null ? principal.getId() : null;
        log.info("REST request to create order. userId: {}, paymentMethod: {}", userId, request.getPaymentMethod());

        OrderResponseDto response = orderService.createOrder(userId, request);

        if (request.getPaymentMethod() == PaymentMethod.ONLINE_PAYMENT) {
            String paymentUrl = paymentService.createPaymentLink(response);
            response.setPaymentUrl(paymentUrl);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<PageResponseDto<OrderResponseDto>> getOrders(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("REST request to fetch orders for user: {}, status: {}", principal.getId(), status);
        return ResponseEntity.ok(orderService.getOrders(principal.getId(), status, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDto> getOrderById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {

        log.info("REST request to fetch order details. userId: {}, orderId: {}", principal.getId(), id);
        return ResponseEntity.ok(orderService.getOrderById(id, principal.getId()));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<OrderResponseDto> cancelOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {

        log.info("REST request to cancel order. userId: {}, orderId: {}", principal.getId(), id);
        return ResponseEntity.ok(orderService.cancelOrder(id, principal.getId()));
    }

    @GetMapping("/tracking")
    public ResponseEntity<PageResponseDto<OrderTrackingResponseDto>> trackOrders(
            @RequestParam String phone,
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("REST request to track orders. phone: {}, name: {}", phone, name);
        return ResponseEntity.ok(orderService.trackOrders(phone, name, page, size));
    }
}
