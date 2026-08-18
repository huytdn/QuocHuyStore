package com.quochuystore.backend.service;

import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.voucher.request.VoucherRequestDto;
import com.quochuystore.backend.dto.voucher.request.VoucherValidateRequestDto;
import com.quochuystore.backend.dto.voucher.response.VoucherResponseDto;
import com.quochuystore.backend.dto.voucher.response.VoucherValidateResponseDto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface VoucherService {

    // Admin Operations
    PageResponseDto<VoucherResponseDto> getAdminVouchers(Boolean isActive, String search, int page, int size);

    VoucherResponseDto getVoucherById(UUID id);

    VoucherResponseDto createVoucher(VoucherRequestDto request);

    VoucherResponseDto updateVoucher(UUID id, VoucherRequestDto request);

    void softDeleteVoucher(UUID id);

    // Client / User Operations
    List<VoucherResponseDto> getPublicVouchers(UUID userId);

    VoucherValidateResponseDto validateVoucher(UUID userId, VoucherValidateRequestDto request);

    // Order Processing Lifecycle Operations
    BigDecimal applyVoucherToOrder(UUID userId, String voucherCode, BigDecimal subtotalPrice);

    void restoreVoucherUsage(UUID userId, String voucherCode);
}
