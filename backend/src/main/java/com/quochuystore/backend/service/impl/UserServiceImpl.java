package com.quochuystore.backend.service.impl;

import tools.jackson.databind.ObjectMapper;
import com.quochuystore.backend.config.CacheKeyConstants;
import com.quochuystore.backend.dto.PageResponseDto;
import com.quochuystore.backend.dto.dashboard.request.DashboardTimeRange;
import com.quochuystore.backend.dto.mapper.UserMapper;
import com.quochuystore.backend.dto.user.request.UserUpdateRequestDto;
import com.quochuystore.backend.dto.user.response.AdminUserListItemDto;
import com.quochuystore.backend.dto.user.response.UserAnalyticsSummaryDto;
import com.quochuystore.backend.dto.user.response.UserDetailResponseDto;
import com.quochuystore.backend.dto.user.response.UserResponseDto;
import com.quochuystore.backend.entity.Address;
import com.quochuystore.backend.entity.User;
import com.quochuystore.backend.entity.enums.UserRole;
import com.quochuystore.backend.exception.ResourceNotFoundException;
import com.quochuystore.backend.repository.AddressRepository;
import com.quochuystore.backend.repository.OrderRepository;
import com.quochuystore.backend.repository.RefreshTokenRepository;
import com.quochuystore.backend.repository.UserRepository;
import com.quochuystore.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final OrderRepository orderRepository;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public UserDetailResponseDto getProfile(UUID userId) {
        log.info("Fetching profile details for user id: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<Address> addresses = addressRepository.findByUser(user);
        return UserMapper.toUserDetailResponseDto(user, addresses);
    }

    @Override
    @Transactional
    public UserResponseDto updateProfile(UUID userId, UserUpdateRequestDto request) {
        log.info("Updating profile metadata for user id: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setDisplayName(request.getDisplayName());
        user.setPhone(request.getPhone());

        User updatedUser = userRepository.save(user);
        return UserMapper.toUserResponseDto(updatedUser);
    }

    @Override
    @Transactional
    public void softDelete(UUID userId) {
        log.info("Performing soft delete / deactivation for user id: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setIsActive(false);
        userRepository.save(user);

        // Revoke all active sessions for this user
        refreshTokenRepository.deleteByUserId(userId);
        log.info("User id: {} has been deactivated and refresh tokens revoked.", userId);
    }

    @Override
    @Transactional
    public int recalculateAllUsersTotalSpent() {
        log.info("Recalculating total spent for all users...");
        int updatedCount = userRepository.recalculateAllUsersTotalSpent();
        log.info("Successfully recalculated total spent for all users. Affected rows: {}", updatedCount);
        return updatedCount;
    }

    @Override
    @Transactional(readOnly = true)
    public UserAnalyticsSummaryDto getCustomerAnalyticsSummary(DashboardTimeRange range, OffsetDateTime from, OffsetDateTime to) {
        TimeWindow window = resolveTimeWindow(range, from, to);
        String cacheKey = CacheKeyConstants.USER_ANALYTICS_SUMMARY_PREFIX + window.cacheKeySuffix();

        // 1. Try Redis Cache
        try {
            String cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                log.info("Cache hit for User Analytics Summary: {}", cacheKey);
                return objectMapper.readValue(cached, UserAnalyticsSummaryDto.class);
            }
        } catch (Exception e) {
            log.error("Failed to read User Analytics Summary cache", e);
        }

        // 2. Fetch data from DB
        long totalCustomers = userRepository.countByRoleAndIsActive(UserRole.USER, true);
        long newCustomers = userRepository.countByRoleAndIsActiveAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                UserRole.USER, true, window.from(), window.to());
        long prevNewCustomers = userRepository.countByRoleAndIsActiveAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                UserRole.USER, true, window.prevFrom(), window.prevTo());

        Double newCustomersGrowthRate = calculateGrowthRate(newCustomers, prevNewCustomers);

        OrderRepository.CustomerOrderStatsProjection stats = orderRepository.getOverallCustomerOrderStats();
        long payingCustomers = (stats != null && stats.getPayingCustomersCount() != null) ? stats.getPayingCustomersCount() : 0L;
        long repeatCustomers = (stats != null && stats.getRepeatCustomersCount() != null) ? stats.getRepeatCustomersCount() : 0L;
        BigDecimal totalRevenue = (stats != null && stats.getTotalRevenue() != null) ? stats.getTotalRevenue() : BigDecimal.ZERO;

        double buyerConversionRate = 0.0;
        if (totalCustomers > 0) {
            buyerConversionRate = BigDecimal.valueOf(((double) payingCustomers / totalCustomers) * 100.0)
                    .setScale(2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        double repeatCustomerRate = 0.0;
        if (payingCustomers > 0) {
            repeatCustomerRate = BigDecimal.valueOf(((double) repeatCustomers / payingCustomers) * 100.0)
                    .setScale(2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        BigDecimal arpu = BigDecimal.ZERO;
        if (payingCustomers > 0) {
            arpu = totalRevenue.divide(BigDecimal.valueOf(payingCustomers), 2, RoundingMode.HALF_UP);
        }

        UserAnalyticsSummaryDto response = UserAnalyticsSummaryDto.builder()
                .totalCustomers(totalCustomers)
                .newCustomers(newCustomers)
                .newCustomersGrowthRate(newCustomersGrowthRate)
                .payingCustomersCount(payingCustomers)
                .buyerConversionRate(buyerConversionRate)
                .repeatCustomersCount(repeatCustomers)
                .repeatCustomerRate(repeatCustomerRate)
                .arpu(arpu)
                .build();

        // 3. Set Redis Cache
        try {
            String json = objectMapper.writeValueAsString(response);
            redisTemplate.opsForValue().set(cacheKey, json, CacheKeyConstants.USER_ANALYTICS_SUMMARY_TTL_MINUTES, TimeUnit.MINUTES);
        } catch (Exception e) {
            log.error("Failed to cache User Analytics Summary", e);
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDto<AdminUserListItemDto> getAdminUsers(String search, BigDecimal minSpent, BigDecimal maxSpent, Pageable pageable) {
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim().toLowerCase() : null;

        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("role"), UserRole.USER));

            if (cleanSearch != null) {
                String pattern = "%" + cleanSearch + "%";
                Predicate usernameLike = cb.like(cb.lower(root.get("username")), pattern);
                Predicate displayNameLike = cb.like(cb.lower(root.get("displayName")), pattern);
                Predicate phoneLike = cb.like(root.get("phone"), pattern);
                predicates.add(cb.or(usernameLike, displayNameLike, phoneLike));
            }

            if (minSpent != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("totalSpent"), minSpent));
            }

            if (maxSpent != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("totalSpent"), maxSpent));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<User> pageResult = userRepository.findAll(spec, pageable);

        List<AdminUserListItemDto> dtoList = pageResult.getContent().stream()
                .map(u -> AdminUserListItemDto.builder()
                        .id(u.getId())
                        .username(u.getUsername())
                        .displayName(u.getDisplayName())
                        .phone(u.getPhone())
                        .totalSpent(u.getTotalSpent() != null ? u.getTotalSpent() : BigDecimal.ZERO)
                        .isActive(u.getIsActive())
                        .createdAt(u.getCreatedAt())
                        .build())
                .toList();

        return PageResponseDto.<AdminUserListItemDto>builder()
                .content(dtoList)
                .pageNo(pageResult.getNumber())
                .pageSize(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    // ==========================================
    // HELPER METHODS
    // ==========================================

    private record TimeWindow(OffsetDateTime from, OffsetDateTime to, OffsetDateTime prevFrom, OffsetDateTime prevTo) {
        String cacheKeySuffix() {
            return from.toEpochSecond() + ":" + to.toEpochSecond();
        }
    }

    private TimeWindow resolveTimeWindow(DashboardTimeRange range, OffsetDateTime from, OffsetDateTime to) {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        if (range == null) {
            range = DashboardTimeRange.THIS_MONTH;
        }

        OffsetDateTime currentFrom;
        OffsetDateTime currentTo = now;
        OffsetDateTime prevFrom;
        OffsetDateTime prevTo;

        switch (range) {
            case TODAY -> {
                currentFrom = now.truncatedTo(ChronoUnit.DAYS);
                prevFrom = currentFrom.minusDays(1);
                prevTo = currentFrom;
            }
            case THIS_WEEK -> {
                currentFrom = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).truncatedTo(ChronoUnit.DAYS);
                prevFrom = currentFrom.minusWeeks(1);
                prevTo = currentFrom;
            }
            case THIS_MONTH -> {
                currentFrom = now.with(TemporalAdjusters.firstDayOfMonth()).truncatedTo(ChronoUnit.DAYS);
                prevFrom = currentFrom.minusMonths(1);
                prevTo = currentFrom;
            }
            case THIS_QUARTER -> {
                int firstMonthOfQuarter = ((now.getMonthValue() - 1) / 3) * 3 + 1;
                currentFrom = now.withMonth(firstMonthOfQuarter).with(TemporalAdjusters.firstDayOfMonth()).truncatedTo(ChronoUnit.DAYS);
                prevFrom = currentFrom.minusMonths(3);
                prevTo = currentFrom;
            }
            case THIS_YEAR -> {
                currentFrom = now.with(TemporalAdjusters.firstDayOfYear()).truncatedTo(ChronoUnit.DAYS);
                prevFrom = currentFrom.minusYears(1);
                prevTo = currentFrom;
            }
            case CUSTOM -> {
                currentFrom = from != null ? from : now.minusDays(30);
                currentTo = to != null ? to : now;
                Duration duration = Duration.between(currentFrom, currentTo);
                prevTo = currentFrom;
                prevFrom = currentFrom.minus(duration);
            }
            default -> {
                currentFrom = now.truncatedTo(ChronoUnit.DAYS);
                prevFrom = currentFrom.minusDays(1);
                prevTo = currentFrom;
            }
        }

        return new TimeWindow(currentFrom, currentTo, prevFrom, prevTo);
    }

    private Double calculateGrowthRate(double current, double previous) {
        if (previous == 0.0) {
            return current > 0.0 ? 100.0 : 0.0;
        }
        double rate = ((current - previous) / previous) * 100.0;
        return BigDecimal.valueOf(rate).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
