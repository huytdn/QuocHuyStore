package com.quochuystore.backend.service;

import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.dashboard.request.DashboardTimeRange;
import com.quochuystore.backend.dto.user.request.UserUpdateRequestDto;
import com.quochuystore.backend.dto.user.response.AdminUserListItemDto;
import com.quochuystore.backend.dto.user.response.UserAnalyticsSummaryDto;
import com.quochuystore.backend.dto.user.response.UserDetailResponseDto;
import com.quochuystore.backend.dto.user.response.UserResponseDto;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public interface UserService {
    UserDetailResponseDto getProfile(UUID userId);

    UserResponseDto updateProfile(UUID userId, UserUpdateRequestDto request);

    void softDelete(UUID userId);

    int recalculateAllUsersTotalSpent();

    UserAnalyticsSummaryDto getCustomerAnalyticsSummary(DashboardTimeRange range, OffsetDateTime from, OffsetDateTime to);

    PageResponseDto<AdminUserListItemDto> getAdminUsers(String search, BigDecimal minSpent, BigDecimal maxSpent, Pageable pageable);
}
