package com.quochuystore.backend.service;

import com.quochuystore.backend.dto.order.response.OrderResponseDto;

public interface PaymentService {
    String createPaymentLink(OrderResponseDto orderResponse);
}
