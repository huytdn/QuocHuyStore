package com.quochuystore.backend.dto.order.request;

import com.quochuystore.backend.entity.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderCreateRequestDto {

    @NotBlank(message = "Receiver name is required")
    @Size(max = 50, message = "Receiver name cannot exceed 50 characters")
    private String receiverName;

    @NotBlank(message = "Receiver phone is required")
    @Size(max = 11, message = "Receiver phone cannot exceed 11 characters")
    private String receiverPhone;

    @NotBlank(message = "Shipping address detail is required")
    private String shippingAddressDetail;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    @Valid
    private List<CartItemRequestDto> items;
}
