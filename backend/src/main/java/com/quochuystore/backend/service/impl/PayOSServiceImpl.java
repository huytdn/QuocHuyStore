package com.quochuystore.backend.service.impl;

import com.quochuystore.backend.dto.order.response.OrderResponseDto;
import com.quochuystore.backend.exception.BadRequestException;
import com.quochuystore.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayOSServiceImpl implements PaymentService {

    private final PayOS payOS;

    @Value("${payos.return-url}")
    private String returnUrl;

    @Value("${payos.cancel-url}")
    private String cancelUrl;

    @Override
    public String createPaymentLink(OrderResponseDto orderResponse) {
        log.info("Creating PayOS payment link for orderId: {}, amount: {}",
                orderResponse.getOrderId(), orderResponse.getTotalPrice());

        try {
            long orderCode = orderResponse.getOrderId();
            long amount = orderResponse.getTotalPrice().longValue();
            String description = "Thanh toan don hang #" + orderCode;

            CreatePaymentLinkRequest request = CreatePaymentLinkRequest.builder()
                    .orderCode(orderCode)
                    .amount(amount)
                    .description(description)
                    .returnUrl(returnUrl)
                    .cancelUrl(cancelUrl)
                    .build();

            CreatePaymentLinkResponse response = payOS.paymentRequests().create(request);
            String checkoutUrl = response.getCheckoutUrl();
            log.info("Successfully created checkout URL: {}", checkoutUrl);
            return checkoutUrl;
        } catch (Exception e) {
            log.error("Failed to create PayOS payment link for order: {}", orderResponse.getOrderId(), e);
            throw new BadRequestException("Failed to generate payment link: " + e.getMessage());
        }
    }
}
