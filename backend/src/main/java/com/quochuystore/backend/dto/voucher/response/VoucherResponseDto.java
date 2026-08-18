package com.quochuystore.backend.dto.voucher.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherResponseDto {

    private UUID id;
    private String code;
    private String name;
    private Integer discountPercent;
    private BigDecimal maxDiscountAmount;
    private BigDecimal minOrderAmount;
    private Integer usageLimitPerUser;
    private Integer remainingUsage;
    private Boolean canUse;
    private OffsetDateTime startAt;
    private OffsetDateTime endAt;
    private Boolean isActive;
    private Boolean isHidden;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
