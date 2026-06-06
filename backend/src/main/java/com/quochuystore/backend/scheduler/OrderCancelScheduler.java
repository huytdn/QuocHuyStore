package com.quochuystore.backend.scheduler;

import com.quochuystore.backend.entity.Order;
import com.quochuystore.backend.entity.OrderItem;
import com.quochuystore.backend.entity.ProductVariation;
import com.quochuystore.backend.entity.enums.OrderStatus;
import com.quochuystore.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

import com.quochuystore.backend.service.OrderService;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderCancelScheduler {

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    @Scheduled(cron = "0 */15 * * * *")
    @Transactional
    public void cancelExpiredPendingPaymentOrders() {
        log.info("Running OrderCancelScheduler to cancel expired pending payment orders...");
        OffsetDateTime threshold = OffsetDateTime.now().minusMinutes(5);
        List<Order> expiredOrders = orderRepository.findByStatusAndCreatedAtBeforeWithItems(
                OrderStatus.PENDING_PAYMENT, threshold);

        if (expiredOrders.isEmpty()) {
            log.info("No expired pending payment orders found.");
            return;
        }

        log.info("Found {} expired pending payment orders to cancel", expiredOrders.size());
        for (Order order : expiredOrders) {
            try {
                int updated = orderRepository.updateStatusConditionally(order.getId(), OrderStatus.CANCELED, OrderStatus.PENDING_PAYMENT);
                if (updated == 1) {
                    orderService.restoreStockForOrder(order);
                    log.info("Order ID {} has been canceled due to payment timeout", order.getId());
                } else {
                    log.info("Order ID {} status changed concurrently. Skipping.", order.getId());
                }
            } catch (Exception e) {
                log.error("Error canceling order ID {}: {}", order.getId(), e.getMessage(), e);
            }
        }
        log.info("Successfully processed canceled orders.");
    }
}
