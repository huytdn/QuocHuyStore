package com.quochuystore.backend.service.impl;

import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.order.request.CartItemRequestDto;
import com.quochuystore.backend.dto.order.request.OrderCreateRequestDto;
import com.quochuystore.backend.dto.order.response.OrderResponseDto;
import com.quochuystore.backend.dto.order.response.OrderTrackingResponseDto;
import com.quochuystore.backend.dto.mapper.OrderMapper;
import com.quochuystore.backend.entity.CartItem;
import com.quochuystore.backend.entity.Order;
import com.quochuystore.backend.entity.OrderItem;
import com.quochuystore.backend.entity.ProductVariation;
import com.quochuystore.backend.entity.User;
import com.quochuystore.backend.entity.enums.OrderStatus;
import com.quochuystore.backend.entity.enums.PaymentMethod;
import com.quochuystore.backend.exception.BadRequestException;
import com.quochuystore.backend.exception.ResourceNotFoundException;
import com.quochuystore.backend.repository.CartItemRepository;
import com.quochuystore.backend.repository.OrderItemRepository;
import com.quochuystore.backend.repository.OrderRepository;
import com.quochuystore.backend.repository.ProductVariationRepository;
import com.quochuystore.backend.repository.UserRepository;
import com.quochuystore.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariationRepository productVariationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public OrderResponseDto createOrder(UUID userId, OrderCreateRequestDto request) {
        log.info("Creating order. userId: {}, paymentMethod: {}", userId, request.getPaymentMethod());

        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        }

        // --- Step 1: Resolve purchase items (from request body or cart) ---
        List<CartItemRequestDto> purchaseItems = new ArrayList<>();
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            purchaseItems = request.getItems();
        } else {
            if (userId != null) {
                List<CartItem> cartItems = cartItemRepository.findByUserIdWithDetails(userId);
                if (cartItems.isEmpty()) {
                    throw new BadRequestException("Shopping cart is empty");
                }
                for (CartItem ci : cartItems) {
                    purchaseItems.add(new CartItemRequestDto(ci.getProductVariation().getId(), ci.getQuantity()));
                }
            } else {
                throw new BadRequestException("Guest checkout must specify items");
            }
        }

        // Batch-fetch variation details to avoid N+1 (no pessimistic lock needed;
        // stock deduction is handled atomically by deductStock() below)
        List<Long> variationIds = purchaseItems.stream()
                .map(CartItemRequestDto::getVariationId)
                .collect(Collectors.toList());

        List<ProductVariation> variations = productVariationRepository.findAllByIdsWithDetails(variationIds);
        Map<Long, ProductVariation> variationMap = variations.stream()
                .collect(Collectors.toMap(ProductVariation::getId, v -> v));

        BigDecimal totalPrice = BigDecimal.ZERO;
        List<OrderItem> orderItemBuilders = new ArrayList<>();

        for (CartItemRequestDto itemDto : purchaseItems) {
            ProductVariation variation = variationMap.get(itemDto.getVariationId());
            if (variation == null) {
                throw new ResourceNotFoundException("Product variation not found with id: " + itemDto.getVariationId());
            }
            // Pre-flight stock check (optimistic guard — actual deduction is atomic below)
            if (variation.getStockQuantity() < itemDto.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product "
                        + variation.getProductColor().getProduct().getName()
                        + " (" + variation.getSize() + "). Available: " + variation.getStockQuantity());
            }
            BigDecimal itemTotal = variation.getUnitPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity()));
            totalPrice = totalPrice.add(itemTotal);

            // Build order item shell (order reference set after order is persisted)
            orderItemBuilders.add(OrderItem.builder()
                    .productVariation(variation)
                    .productName(variation.getProductColor().getProduct().getName())
                    .colorName(variation.getProductColor().getColorName())
                    .sizeName(variation.getSize())
                    .quantity(itemDto.getQuantity())
                    .priceAtPurchase(variation.getUnitPrice())
                    .build());
        }

        // If rows_affected = 0 the stock was already exhausted by a concurrent order.
        for (int i = 0; i < purchaseItems.size(); i++) {
            CartItemRequestDto itemDto = purchaseItems.get(i);
            int affected = productVariationRepository.deductStock(itemDto.getVariationId(), itemDto.getQuantity());
            if (affected == 0) {
                ProductVariation variation = variationMap.get(itemDto.getVariationId());
                throw new BadRequestException("Stock exhausted for product "
                        + variation.getProductColor().getProduct().getName()
                        + " (" + variation.getSize() + ") during checkout. Please try again.");
            }
        }

        // --- Step 4: Persist Order with final totalPrice in a single save ---
        OrderStatus status = request.getPaymentMethod() == PaymentMethod.COD
                ? OrderStatus.PENDING_APPROVAL
                : OrderStatus.PENDING_PAYMENT;

        Order order = Order.builder()
                .user(user)
                .receiverName(request.getReceiverName())
                .receiverPhone(request.getReceiverPhone())
                .shippingAddressDetail(request.getShippingAddressDetail())
                .discountAmount(BigDecimal.ZERO)
                .totalPrice(totalPrice)
                .status(status)
                .paymentMethod(request.getPaymentMethod())
                .build();

        order = orderRepository.save(order);

        // --- Step 5: Set order reference on order items, persist them & finalize ---
        for (OrderItem item : orderItemBuilders) {
            item.setOrder(order);
        }
        List<OrderItem> savedItems = orderItemRepository.saveAll(orderItemBuilders);
        order.setOrderItems(savedItems);

        if (userId != null) {
            cartItemRepository.deleteByUserId(userId);
        }

        log.info("Order {} created successfully. totalPrice: {}", order.getId(), totalPrice);
        return OrderMapper.toOrderResponseDto(order);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDto<OrderResponseDto> getOrders(UUID userId, OrderStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> orderPage;

        if (status != null) {
            orderPage = orderRepository.findByUserIdAndStatus(userId, status, pageable);
        } else {
            orderPage = orderRepository.findByUserId(userId, pageable);
        }

        return fetchItemsAndBuildResponse(orderPage, page, size);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponseDto getOrderById(Long id, UUID userId) {
        Order order = orderRepository.findByIdAndUserIdWithItems(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found or access denied"));
        return OrderMapper.toOrderResponseDto(order);
    }

    @Override
    @Transactional
    public OrderResponseDto cancelOrder(Long id, UUID userId) {
        List<OrderStatus> allowedStatuses = List.of(OrderStatus.PENDING_APPROVAL, OrderStatus.PENDING_PAYMENT);
        int updated = orderRepository.updateStatusAndUserConditionally(id, userId, OrderStatus.CANCELED,
                allowedStatuses);

        if (updated == 0) {
            Order order = orderRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found or access denied"));
            throw new BadRequestException("Order cannot be canceled in its current state: " + order.getStatus());
        }

        Order order = orderRepository.findByIdAndUserIdWithItems(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found or access denied"));

        restoreStockForOrder(order);

        return OrderMapper.toOrderResponseDto(order);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDto<OrderTrackingResponseDto> trackOrders(String phone, String name, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> orderPage = orderRepository.findByReceiverPhoneAndReceiverNameAndUserIsNullAndStatusNotIn(
                phone,
                name,
                List.of(OrderStatus.CANCELED, OrderStatus.DELIVERED, OrderStatus.DELIVERY_FAILED),
                pageable);

        if (orderPage.isEmpty()) {
            return new PageResponseDto<>(Collections.emptyList(), page, size, 0L, 0, true);
        }

        List<Long> orderIds = orderPage.getContent().stream()
                .map(Order::getId)
                .collect(Collectors.toList());

        List<OrderItem> allItems = orderItemRepository.findByOrderIdIn(orderIds);
        Map<Long, List<OrderItem>> itemsMap = allItems.stream()
                .collect(Collectors.groupingBy(item -> item.getOrder().getId()));

        List<OrderTrackingResponseDto> dtos = orderPage.getContent().stream().map(order -> {
            order.setOrderItems(itemsMap.getOrDefault(order.getId(), Collections.emptyList()));
            return OrderMapper.toOrderTrackingResponseDto(order);
        }).collect(Collectors.toList());

        return new PageResponseDto<>(
                dtos,
                orderPage.getNumber(),
                orderPage.getSize(),
                orderPage.getTotalElements(),
                orderPage.getTotalPages(),
                orderPage.isLast());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDto<OrderResponseDto> getAdminOrders(OrderStatus status, UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> orderPage;

        if (status != null && userId != null) {
            orderPage = orderRepository.findByUserIdAndStatus(userId, status, pageable);
        } else if (status != null) {
            orderPage = orderRepository.findByStatus(status, pageable);
        } else if (userId != null) {
            orderPage = orderRepository.findByUserId(userId, pageable);
        } else {
            orderPage = orderRepository.findAll(pageable);
        }

        return fetchItemsAndBuildResponse(orderPage, page, size);
    }

    @Override
    @Transactional
    public OrderResponseDto updateOrderStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        OrderStatus previousStatus = order.getStatus();

        if (previousStatus == status) {
            return OrderMapper.toOrderResponseDto(order);
        }

        if (previousStatus == OrderStatus.DELIVERED || previousStatus == OrderStatus.DELIVERY_FAILED
                || previousStatus == OrderStatus.CANCELED) {
            throw new BadRequestException("Cannot update order in a final state: " + previousStatus);
        }

        if (previousStatus == OrderStatus.PENDING_PAYMENT) {
            throw new BadRequestException("Orders awaiting payment cannot be manually updated by admin.");
        }

        if (status == OrderStatus.CANCELED) {
            if (previousStatus != OrderStatus.PENDING_APPROVAL && previousStatus != OrderStatus.AWAITING_PICKUP) {
                throw new BadRequestException(
                        "Order can only be cancelled when its status is PENDING_APPROVAL or AWAITING_PICKUP. Current status: "
                                + previousStatus);
            }
            // Restore stock
            restoreStockForOrder(order);
        } else {
            // Step-by-step state transition validation
            boolean isValidTransition = false;
            if (previousStatus == OrderStatus.PENDING_APPROVAL && status == OrderStatus.AWAITING_PICKUP) {
                isValidTransition = true;
            } else if (previousStatus == OrderStatus.AWAITING_PICKUP && status == OrderStatus.IN_TRANSIT) {
                isValidTransition = true;
            } else if (previousStatus == OrderStatus.IN_TRANSIT
                    && (status == OrderStatus.DELIVERED || status == OrderStatus.DELIVERY_FAILED)) {
                isValidTransition = true;
            }

            if (!isValidTransition) {
                throw new BadRequestException("Invalid status transition from " + previousStatus + " to " + status
                        + ". Admin can only transition status step-by-step.");
            }

            if (status == OrderStatus.DELIVERY_FAILED) {
                restoreStockForOrder(order);
            }
        }

        order.setStatus(status);
        order = orderRepository.save(order);

        return OrderMapper.toOrderResponseDto(order);
    }

    @Override
    @Transactional
    public void updateOrderStatusByPayOSCode(Long orderId, boolean success) {
        if (success) {
            int updated = orderRepository.updateStatusConditionally(orderId, OrderStatus.AWAITING_PICKUP,
                    OrderStatus.PENDING_PAYMENT);
            if (updated == 1) {
                log.info("Order {} payment successful. Updated status to AWAITING_PICKUP", orderId);
            } else {
                Order order = orderRepository.findById(orderId)
                        .orElseThrow(() -> new ResourceNotFoundException("Order not found with code: " + orderId));
                log.warn("Order {} is not in PENDING_PAYMENT status. Skipping webhook processing. Current: {}",
                        orderId, order.getStatus());
            }
        } else {
            if (cancelAndRestoreStock(orderId)) {
                log.info("Order {} payment failed. Stock restored and updated status to CANCELED", orderId);
            } else {
                Order order = orderRepository.findById(orderId)
                        .orElseThrow(() -> new ResourceNotFoundException("Order not found with code: " + orderId));
                log.warn("Order {} is not in PENDING_PAYMENT status. Skipping webhook processing. Current: {}",
                        orderId, order.getStatus());
            }
        }
    }

    @Override
    @Transactional
    public void restoreStockForOrder(Order order) {
        // Atomic restoration: stock = stock + qty at DB level — no read required, no
        // race condition.
        for (OrderItem item : order.getOrderItems()) {
            if (item.getProductVariation() != null) {
                productVariationRepository.restoreStock(
                        item.getProductVariation().getId(),
                        item.getQuantity());
                log.debug("Restored {} units to variation id: {}",
                        item.getQuantity(), item.getProductVariation().getId());
            }
        }
    }

    @Override
    @Transactional
    public void cancelOrderOnPaymentLinkFailure(Long orderId) {
        if (cancelAndRestoreStock(orderId)) {
            log.info("Order {} payment link creation failed. Stock restored and status updated to CANCELED", orderId);
        }
    }

    @Override
    @Transactional
    public boolean cancelAndRestoreStock(Long orderId) {
        int updated = orderRepository.updateStatusConditionally(orderId, OrderStatus.CANCELED,
                OrderStatus.PENDING_PAYMENT);
        if (updated == 1) {
            Order order = orderRepository.findByIdWithItems(orderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
            restoreStockForOrder(order);
            return true;
        }
        return false;
    }

    private PageResponseDto<OrderResponseDto> fetchItemsAndBuildResponse(Page<Order> orderPage, int page, int size) {
        if (orderPage.isEmpty()) {
            return new PageResponseDto<>(Collections.emptyList(), page, size, 0L, 0, true);
        }

        List<Long> orderIds = orderPage.getContent().stream()
                .map(Order::getId)
                .collect(Collectors.toList());

        List<OrderItem> allItems = orderItemRepository.findByOrderIdIn(orderIds);
        Map<Long, List<OrderItem>> itemsMap = allItems.stream()
                .collect(Collectors.groupingBy(item -> item.getOrder().getId()));

        List<OrderResponseDto> dtos = orderPage.getContent().stream().map(order -> {
            order.setOrderItems(itemsMap.getOrDefault(order.getId(), Collections.emptyList()));
            return OrderMapper.toOrderResponseDto(order);
        }).collect(Collectors.toList());

        return new PageResponseDto<>(
                dtos,
                orderPage.getNumber(),
                orderPage.getSize(),
                orderPage.getTotalElements(),
                orderPage.getTotalPages(),
                orderPage.isLast());
    }
}
