package com.quochuystore.backend.service.impl;

import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.mapper.VoucherMapper;
import com.quochuystore.backend.dto.voucher.request.VoucherRequestDto;
import com.quochuystore.backend.dto.voucher.request.VoucherValidateRequestDto;
import com.quochuystore.backend.dto.voucher.response.VoucherResponseDto;
import com.quochuystore.backend.dto.voucher.response.VoucherValidateResponseDto;
import com.quochuystore.backend.entity.User;
import com.quochuystore.backend.entity.UserVoucher;
import com.quochuystore.backend.entity.Voucher;
import com.quochuystore.backend.exception.BadRequestException;
import com.quochuystore.backend.exception.ResourceNotFoundException;
import com.quochuystore.backend.repository.UserRepository;
import com.quochuystore.backend.repository.UserVoucherRepository;
import com.quochuystore.backend.repository.VoucherRepository;
import com.quochuystore.backend.service.VoucherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;
    private final UserVoucherRepository userVoucherRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponseDto<VoucherResponseDto> getAdminVouchers(Boolean isActive, String search, int page, int size) {
        log.info("Admin fetching vouchers. isActive: {}, search: {}, page: {}, size: {}", isActive, search, page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Voucher> voucherPage = voucherRepository.findAdminVouchers(isActive, search != null ? search.trim() : null, pageable);

        List<VoucherResponseDto> content = voucherPage.getContent().stream()
                .map(VoucherMapper::toVoucherResponseDto)
                .toList();

        return PageResponseDto.<VoucherResponseDto>builder()
                .content(content)
                .pageNo(voucherPage.getNumber())
                .pageSize(voucherPage.getSize())
                .totalElements(voucherPage.getTotalElements())
                .totalPages(voucherPage.getTotalPages())
                .last(voucherPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public VoucherResponseDto getVoucherById(UUID id) {
        log.info("Fetching voucher by id: {}", id);
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher not found with id: " + id));
        return VoucherMapper.toVoucherResponseDto(voucher);
    }

    @Override
    @Transactional
    public VoucherResponseDto createVoucher(VoucherRequestDto request) {
        log.info("Creating voucher with code: {}", request.getCode());

        String normalizedCode = request.getCode().trim().toUpperCase();

        if (voucherRepository.existsByCodeIgnoreCase(normalizedCode)) {
            log.warn("Voucher creation failed: Code '{}' already exists", normalizedCode);
            throw new BadRequestException("Mã voucher đã tồn tại: " + normalizedCode);
        }

        if (!request.getStartAt().isBefore(request.getEndAt())) {
            throw new BadRequestException("Thời gian bắt đầu phải trước thời gian kết thúc");
        }

        Voucher voucher = Voucher.builder()
                .code(normalizedCode)
                .name(request.getName().trim())
                .discountPercent(request.getDiscountPercent())
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .minOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO)
                .usageLimitPerUser(request.getUsageLimitPerUser() != null ? request.getUsageLimitPerUser() : 1)
                .startAt(request.getStartAt())
                .endAt(request.getEndAt())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .isHidden(request.getIsHidden() != null ? request.getIsHidden() : false)
                .build();

        Voucher savedVoucher = voucherRepository.save(voucher);
        log.info("Successfully created voucher with id: {}", savedVoucher.getId());
        return VoucherMapper.toVoucherResponseDto(savedVoucher);
    }

    @Override
    @Transactional
    public VoucherResponseDto updateVoucher(UUID id, VoucherRequestDto request) {
        log.info("Updating voucher id: {}", id);

        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher not found with id: " + id));

        String normalizedCode = request.getCode().trim().toUpperCase();

        if (voucherRepository.existsByCodeIgnoreCaseAndIdNot(normalizedCode, id)) {
            log.warn("Voucher update failed: Code '{}' already exists on another voucher", normalizedCode);
            throw new BadRequestException("Mã voucher đã tồn tại trên voucher khác: " + normalizedCode);
        }

        if (!request.getStartAt().isBefore(request.getEndAt())) {
            throw new BadRequestException("Thời gian bắt đầu phải trước thời gian kết thúc");
        }

        voucher.setCode(normalizedCode);
        voucher.setName(request.getName().trim());
        voucher.setDiscountPercent(request.getDiscountPercent());
        voucher.setMaxDiscountAmount(request.getMaxDiscountAmount());
        voucher.setMinOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO);
        voucher.setUsageLimitPerUser(request.getUsageLimitPerUser() != null ? request.getUsageLimitPerUser() : 1);
        voucher.setStartAt(request.getStartAt());
        voucher.setEndAt(request.getEndAt());
        voucher.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        voucher.setIsHidden(request.getIsHidden() != null ? request.getIsHidden() : false);

        Voucher updatedVoucher = voucherRepository.save(voucher);
        log.info("Successfully updated voucher with id: {}", updatedVoucher.getId());
        return VoucherMapper.toVoucherResponseDto(updatedVoucher);
    }

    @Override
    @Transactional
    public void softDeleteVoucher(UUID id) {
        log.info("Soft deleting voucher id: {}", id);
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher not found with id: " + id));
        voucher.setIsActive(false);
        voucherRepository.save(voucher);
        log.info("Successfully soft deleted voucher id: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VoucherResponseDto> getPublicVouchers(UUID userId) {
        log.info("Fetching public active vouchers for user: {}", userId);
        OffsetDateTime now = OffsetDateTime.now();
        List<Voucher> activeVouchers = voucherRepository.findActivePublicVouchers(now);

        if (activeVouchers.isEmpty()) {
            return Collections.emptyList();
        }

        Map<UUID, Integer> userUsageMap = Collections.emptyMap();
        if (userId != null) {
            List<UUID> voucherIds = activeVouchers.stream().map(Voucher::getId).toList();
            List<UserVoucher> userVouchers = userVoucherRepository.findByUserIdAndVoucherIdIn(userId, voucherIds);
            userUsageMap = userVouchers.stream()
                    .collect(Collectors.toMap(uv -> uv.getVoucher().getId(), UserVoucher::getUsageCount));
        }

        Map<UUID, Integer> finalUsageMap = userUsageMap;
        return activeVouchers.stream()
                .map(v -> {
                    int usage = finalUsageMap.getOrDefault(v.getId(), 0);
                    int remaining = Math.max(0, v.getUsageLimitPerUser() - usage);
                    boolean canUse = (userId == null) || (remaining > 0);
                    return VoucherMapper.toVoucherResponseDto(v, userId != null ? remaining : v.getUsageLimitPerUser(), canUse);
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public VoucherValidateResponseDto validateVoucher(UUID userId, VoucherValidateRequestDto request) {
        log.info("Validating voucher code: {} for user: {}, orderAmount: {}", request.getCode(), userId, request.getOrderAmount());

        if (userId == null) {
            throw new BadRequestException("Bạn cần đăng nhập để áp dụng mã giảm giá");
        }

        String normalizedCode = request.getCode().trim().toUpperCase();
        Voucher voucher = voucherRepository.findByCodeIgnoreCase(normalizedCode)
                .orElseThrow(() -> new ResourceNotFoundException("Mã giảm giá không tồn tại: " + normalizedCode));

        if (!Boolean.TRUE.equals(voucher.getIsActive())) {
            throw new BadRequestException("Mã giảm giá không còn hoạt động");
        }

        OffsetDateTime now = OffsetDateTime.now();
        if (now.isBefore(voucher.getStartAt())) {
            throw new BadRequestException("Mã giảm giá chưa đến thời gian áp dụng");
        }
        if (now.isAfter(voucher.getEndAt())) {
            throw new BadRequestException("Mã giảm giá đã hết hạn");
        }

        if (request.getOrderAmount().compareTo(voucher.getMinOrderAmount()) < 0) {
            throw new BadRequestException(String.format("Đơn hàng chưa đạt giá trị tối thiểu %s để áp dụng mã này", voucher.getMinOrderAmount()));
        }

        UserVoucher userVoucher = userVoucherRepository.findByUserIdAndVoucherId(userId, voucher.getId()).orElse(null);
        int currentUsage = (userVoucher != null) ? userVoucher.getUsageCount() : 0;
        if (currentUsage >= voucher.getUsageLimitPerUser()) {
            throw new BadRequestException("Bạn đã sử dụng hết số lượt cho phép của mã giảm giá này");
        }

        BigDecimal discountPercent = BigDecimal.valueOf(voucher.getDiscountPercent());
        BigDecimal rawDiscount = request.getOrderAmount()
                .multiply(discountPercent)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal finalDiscount = rawDiscount;
        if (voucher.getMaxDiscountAmount() != null && rawDiscount.compareTo(voucher.getMaxDiscountAmount()) > 0) {
            finalDiscount = voucher.getMaxDiscountAmount();
        }

        BigDecimal finalAmount = request.getOrderAmount().subtract(finalDiscount).max(BigDecimal.ZERO);

        return VoucherValidateResponseDto.builder()
                .valid(true)
                .voucherCode(voucher.getCode())
                .voucherName(voucher.getName())
                .discountPercent(voucher.getDiscountPercent())
                .discountAmount(finalDiscount)
                .finalAmount(finalAmount)
                .message("Áp dụng mã giảm giá thành công")
                .build();
    }

    @Override
    @Transactional
    public BigDecimal applyVoucherToOrder(UUID userId, String voucherCode, BigDecimal subtotalPrice) {
        log.info("Applying voucher code: {} to order for user: {}, subtotal: {}", voucherCode, userId, subtotalPrice);

        if (userId == null) {
            throw new BadRequestException("Vui lòng đăng nhập để áp dụng mã giảm giá");
        }

        String normalizedCode = voucherCode.trim().toUpperCase();

        // 1. Pessimistic Lock on Voucher row to prevent concurrent race conditions
        Voucher voucher = voucherRepository.findByCodeIgnoreCaseForUpdate(normalizedCode)
                .orElseThrow(() -> new ResourceNotFoundException("Mã giảm giá không tồn tại: " + normalizedCode));

        if (!Boolean.TRUE.equals(voucher.getIsActive())) {
            throw new BadRequestException("Mã giảm giá không còn hoạt động");
        }

        OffsetDateTime now = OffsetDateTime.now();
        if (now.isBefore(voucher.getStartAt()) || now.isAfter(voucher.getEndAt())) {
            throw new BadRequestException("Mã giảm giá không trong thời gian có hiệu lực");
        }

        if (subtotalPrice.compareTo(voucher.getMinOrderAmount()) < 0) {
            throw new BadRequestException(String.format("Đơn hàng chưa đạt giá trị tối thiểu %s để áp dụng mã này", voucher.getMinOrderAmount()));
        }

        // 2. Lock UserVoucher record for update
        UserVoucher userVoucher = userVoucherRepository.findByUserIdAndVoucherIdForUpdate(userId, voucher.getId())
                .orElse(null);

        int currentUsage = (userVoucher != null) ? userVoucher.getUsageCount() : 0;
        if (currentUsage >= voucher.getUsageLimitPerUser()) {
            throw new BadRequestException("Bạn đã sử dụng hết số lượt cho phép của mã giảm giá: " + voucher.getCode());
        }

        if (userVoucher == null) {
            User userProxy = userRepository.getReferenceById(userId);
            userVoucher = UserVoucher.builder()
                    .user(userProxy)
                    .voucher(voucher)
                    .usageCount(1)
                    .build();
        } else {
            userVoucher.setUsageCount(userVoucher.getUsageCount() + 1);
        }
        userVoucherRepository.save(userVoucher);

        // 3. Compute discount amount
        BigDecimal discountPercent = BigDecimal.valueOf(voucher.getDiscountPercent());
        BigDecimal rawDiscount = subtotalPrice
                .multiply(discountPercent)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal finalDiscount = rawDiscount;
        if (voucher.getMaxDiscountAmount() != null && rawDiscount.compareTo(voucher.getMaxDiscountAmount()) > 0) {
            finalDiscount = voucher.getMaxDiscountAmount();
        }

        log.info("Voucher '{}' successfully applied. Computed discount: {}", voucher.getCode(), finalDiscount);
        return finalDiscount;
    }

    @Override
    @Transactional
    public void restoreVoucherUsage(UUID userId, String voucherCode) {
        if (userId == null || voucherCode == null || voucherCode.isBlank()) {
            return;
        }

        String normalizedCode = voucherCode.trim().toUpperCase();
        log.info("Restoring voucher usage for user: {}, voucherCode: {}", userId, normalizedCode);

        userVoucherRepository.findByUserIdAndVoucherCode(userId, normalizedCode)
                .ifPresent(uv -> {
                    if (uv.getUsageCount() > 0) {
                        uv.setUsageCount(uv.getUsageCount() - 1);
                        userVoucherRepository.save(uv);
                        log.info("Restored 1 voucher usage for user {}. New usage_count: {}", userId, uv.getUsageCount());
                    }
                });
    }
}
