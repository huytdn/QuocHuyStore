package com.quochuystore.backend.dto.mapper;

import com.quochuystore.backend.dto.voucher.response.VoucherResponseDto;
import com.quochuystore.backend.entity.Voucher;

public final class VoucherMapper {

    private VoucherMapper() {
    }

    public static VoucherResponseDto toVoucherResponseDto(Voucher voucher) {
        return toVoucherResponseDto(voucher, null, null);
    }

    public static VoucherResponseDto toVoucherResponseDto(Voucher voucher, Integer remainingUsage, Boolean canUse) {
        if (voucher == null) {
            return null;
        }

        return VoucherResponseDto.builder()
                .id(voucher.getId())
                .code(voucher.getCode())
                .name(voucher.getName())
                .discountPercent(voucher.getDiscountPercent())
                .maxDiscountAmount(voucher.getMaxDiscountAmount())
                .minOrderAmount(voucher.getMinOrderAmount())
                .usageLimitPerUser(voucher.getUsageLimitPerUser())
                .remainingUsage(remainingUsage)
                .canUse(canUse)
                .startAt(voucher.getStartAt())
                .endAt(voucher.getEndAt())
                .isActive(voucher.getIsActive())
                .isHidden(voucher.getIsHidden())
                .createdAt(voucher.getCreatedAt())
                .updatedAt(voucher.getUpdatedAt())
                .build();
    }
}
