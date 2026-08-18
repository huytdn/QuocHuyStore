package com.quochuystore.backend.dto.voucher.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherValidateResponseDto {

    private Boolean valid;
    private String voucherCode;
    private String voucherName;
    private Integer discountPercent;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String message;
}
