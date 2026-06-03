package com.quochuystore.backend.entity.enums;

public enum OrderStatus {
    PENDING_APPROVAL,
    PENDING_PAYMENT,
    AWAITING_PICKUP,
    IN_TRANSIT,
    DELIVERED,
    DELIVERY_FAILED,
    CANCELED
}
