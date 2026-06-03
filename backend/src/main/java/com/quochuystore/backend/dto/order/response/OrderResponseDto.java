package com.quochuystore.backend.dto.order.response;

import com.quochuystore.backend.entity.enums.OrderStatus;
import com.quochuystore.backend.entity.enums.PaymentMethod;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponseDto {
    private Long orderId;
    private String receiverName;
    private String receiverPhone;
    private String shippingAddressDetail;
    private BigDecimal totalPrice;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private String paymentUrl;
    private OffsetDateTime createdAt;
    private List<OrderItemResponseDto> items;
}
