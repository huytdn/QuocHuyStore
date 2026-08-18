package com.quochuystore.backend.dto.voucher.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherValidateRequestDto {

    @NotBlank(message = "Voucher code is required")
    private String code;

    @NotNull(message = "Order amount is required")
    @DecimalMin(value = "0.00", message = "Order amount must be greater than or equal to 0")
    private BigDecimal orderAmount;
}
