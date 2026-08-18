package com.quochuystore.backend.controller;

import com.quochuystore.backend.dto.voucher.request.VoucherValidateRequestDto;
import com.quochuystore.backend.dto.voucher.response.VoucherResponseDto;
import com.quochuystore.backend.dto.voucher.response.VoucherValidateResponseDto;
import com.quochuystore.backend.security.UserPrincipal;
import com.quochuystore.backend.service.VoucherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/vouchers")
@RequiredArgsConstructor
@Slf4j
public class VoucherController {

    private final VoucherService voucherService;

    @GetMapping
    public ResponseEntity<List<VoucherResponseDto>> getPublicVouchers(
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal != null ? principal.getId() : null;
        log.info("REST request to get active public vouchers. userId: {}", userId);
        return ResponseEntity.ok(voucherService.getPublicVouchers(userId));
    }

    @PostMapping("/validate")
    public ResponseEntity<VoucherValidateResponseDto> validateVoucher(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody VoucherValidateRequestDto request) {
        UUID userId = principal != null ? principal.getId() : null;
        log.info("REST request to validate voucher code: {}, userId: {}", request.getCode(), userId);
        return ResponseEntity.ok(voucherService.validateVoucher(userId, request));
    }
}
