package com.quochuystore.backend.dto.order.response;

import com.quochuystore.backend.entity.enums.OrderStatus;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderTrackingResponseDto {
    private OffsetDateTime createdAt;
    private OrderStatus status;
    private String receiverName;
    private List<OrderItemTrackingDto> items;
}
