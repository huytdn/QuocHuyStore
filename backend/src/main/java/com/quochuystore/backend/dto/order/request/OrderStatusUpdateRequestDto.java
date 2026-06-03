package com.quochuystore.backend.dto.order.request;

import com.quochuystore.backend.entity.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderStatusUpdateRequestDto {

    @NotNull(message = "Order status is required")
    private OrderStatus status;
}
