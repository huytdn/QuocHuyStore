package com.quochuystore.backend.dto.voucher.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherRequestDto {

    @NotBlank(message = "Voucher code is required")
    @Size(max = 50, message = "Voucher code must not exceed 50 characters")
    private String code;

    @NotBlank(message = "Voucher name is required")
    @Size(max = 100, message = "Voucher name must not exceed 100 characters")
    private String name;

    @NotNull(message = "Discount percent is required")
    @Min(value = 1, message = "Discount percent must be at least 1%")
    @Max(value = 100, message = "Discount percent must not exceed 100%")
    private Integer discountPercent;

    @DecimalMin(value = "0.00", message = "Max discount amount must be greater than or equal to 0")
    private BigDecimal maxDiscountAmount;

    @NotNull(message = "Min order amount is required")
    @DecimalMin(value = "0.00", message = "Min order amount must be greater than or equal to 0")
    private BigDecimal minOrderAmount;

    @NotNull(message = "Usage limit per user is required")
    @Min(value = 1, message = "Usage limit per user must be at least 1")
    private Integer usageLimitPerUser;

    @NotNull(message = "Start date is required")
    private OffsetDateTime startAt;

    @NotNull(message = "End date is required")
    private OffsetDateTime endAt;

    @NotNull(message = "isActive flag is required")
    private Boolean isActive;

    @NotNull(message = "isHidden flag is required")
    private Boolean isHidden;
}
