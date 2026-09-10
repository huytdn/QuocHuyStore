package com.quochuystore.backend.service.impl;

import com.quochuystore.backend.exception.TooManyRequestsException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RedisRateLimiterServiceImplTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    private RedisRateLimiterServiceImpl rateLimiterService;

    @BeforeEach
    void setUp() {
        rateLimiterService = new RedisRateLimiterServiceImpl(redisTemplate);
        ReflectionTestUtils.setField(rateLimiterService, "limitPerMinute", 10);
    }

    @Test
    void checkRateLimit_doesNotThrow_whenUnderLimit() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment("qhs:ratelimit:imgsearch:1.2.3.4")).thenReturn(3L);

        assertThatCode(() -> rateLimiterService.checkRateLimit("1.2.3.4")).doesNotThrowAnyException();
    }

    @Test
    void checkRateLimit_setsExpiry_onFirstRequestInWindow() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment("qhs:ratelimit:imgsearch:1.2.3.4")).thenReturn(1L);

        rateLimiterService.checkRateLimit("1.2.3.4");

        verify(redisTemplate).expire(eq("qhs:ratelimit:imgsearch:1.2.3.4"), eq(Duration.ofSeconds(60)));
    }

    @Test
    void checkRateLimit_throwsTooManyRequests_whenOverLimit() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment("qhs:ratelimit:imgsearch:1.2.3.4")).thenReturn(11L);

        assertThatThrownBy(() -> rateLimiterService.checkRateLimit("1.2.3.4"))
                .isInstanceOf(TooManyRequestsException.class);
    }

    @Test
    void checkRateLimit_failsOpen_whenRedisThrows() {
        when(redisTemplate.opsForValue()).thenThrow(new RuntimeException("redis down"));

        assertThatCode(() -> rateLimiterService.checkRateLimit("1.2.3.4")).doesNotThrowAnyException();
    }
}
