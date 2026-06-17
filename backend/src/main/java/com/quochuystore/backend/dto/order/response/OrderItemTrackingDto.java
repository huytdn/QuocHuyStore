package com.quochuystore.backend.dto.order.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemTrackingDto {
    private String productName;
    private Integer quantity;
}
