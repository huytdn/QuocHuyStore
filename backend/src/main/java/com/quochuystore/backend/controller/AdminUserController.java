package com.quochuystore.backend.controller;

import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.dashboard.request.DashboardTimeRange;
import com.quochuystore.backend.dto.user.response.AdminUserListItemDto;
import com.quochuystore.backend.dto.user.response.UserAnalyticsSummaryDto;
import com.quochuystore.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;

    @PostMapping("/recalculate-all-spent")
    public ResponseEntity<Map<String, Object>> recalculateAllUsersTotalSpent() {
        log.info("REST request by ADMIN to recalculate total spent for all users");
        int updatedCount = userService.recalculateAllUsersTotalSpent();
        return ResponseEntity.ok(Map.of(
                "message", "Successfully recalculated total spent for all users",
                "affectedUsers", updatedCount
        ));
    }

    @GetMapping("/summary")
    public ResponseEntity<UserAnalyticsSummaryDto> getCustomerAnalyticsSummary(
            @RequestParam(required = false, defaultValue = "THIS_MONTH") DashboardTimeRange range,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to) {
        log.info("REST request by ADMIN for Customer Analytics Summary. range: {}, from: {}, to: {}", range, from, to);
        UserAnalyticsSummaryDto response = userService.getCustomerAnalyticsSummary(range, from, to);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<PageResponseDto<AdminUserListItemDto>> getAdminUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BigDecimal minSpent,
            @RequestParam(required = false) BigDecimal maxSpent,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "totalSpent") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        log.info("REST request by ADMIN for User List. search: {}, minSpent: {}, maxSpent: {}, page: {}, size: {}, sortBy: {}, sortDirection: {}",
                search, minSpent, maxSpent, page, size, sortBy, sortDirection);

        String property = "createdAt".equalsIgnoreCase(sortBy) ? "createdAt" : "totalSpent";
        Sort.Direction direction = "ASC".equalsIgnoreCase(sortDirection) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, property));

        PageResponseDto<AdminUserListItemDto> response = userService.getAdminUsers(search, minSpent, maxSpent, pageable);
        return ResponseEntity.ok(response);
    }
}
