package com.quochuystore.backend.controller;

import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.voucher.request.VoucherRequestDto;
import com.quochuystore.backend.dto.voucher.response.VoucherResponseDto;
import com.quochuystore.backend.service.VoucherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/admin/vouchers")
@RequiredArgsConstructor
@Slf4j
public class AdminVoucherController {

    private final VoucherService voucherService;

    @GetMapping
    public ResponseEntity<PageResponseDto<VoucherResponseDto>> getAdminVouchers(
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("REST request by ADMIN to get vouchers. isActive: {}, search: {}, page: {}, size: {}",
                isActive, search, page, size);
        return ResponseEntity.ok(voucherService.getAdminVouchers(isActive, search, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VoucherResponseDto> getVoucherById(@PathVariable UUID id) {
        log.info("REST request by ADMIN to get voucher details. id: {}", id);
        return ResponseEntity.ok(voucherService.getVoucherById(id));
    }

    @PostMapping
    public ResponseEntity<VoucherResponseDto> createVoucher(@Valid @RequestBody VoucherRequestDto request) {
        log.info("REST request by ADMIN to create voucher: {}", request.getCode());
        return ResponseEntity.status(HttpStatus.CREATED).body(voucherService.createVoucher(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VoucherResponseDto> updateVoucher(
            @PathVariable UUID id,
            @Valid @RequestBody VoucherRequestDto request) {
        log.info("REST request by ADMIN to update voucher. id: {}", id);
        return ResponseEntity.ok(voucherService.updateVoucher(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVoucher(@PathVariable UUID id) {
        log.info("REST request by ADMIN to soft delete voucher. id: {}", id);
        voucherService.softDeleteVoucher(id);
        return ResponseEntity.noContent().build();
    }
}
