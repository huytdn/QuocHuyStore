package com.quochuystore.backend.service.impl;

import com.quochuystore.backend.config.CacheKeyConstants;
import com.quochuystore.backend.exception.TooManyRequestsException;
import com.quochuystore.backend.service.RateLimiterService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@Slf4j
public class RedisRateLimiterServiceImpl implements RateLimiterService {

    private final StringRedisTemplate redisTemplate;

    @Value("${app.image-search.rate-limit-per-minute}")
    private int limitPerMinute;

    public RedisRateLimiterServiceImpl(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public void checkRateLimit(String key) {
        String redisKey = CacheKeyConstants.IMAGE_SEARCH_RATE_LIMIT_PREFIX + key;
        try {
            Long count = redisTemplate.opsForValue().increment(redisKey);
            if (count != null && count == 1L) {
                redisTemplate.expire(redisKey, Duration.ofSeconds(60));
            }
            if (count != null && count > limitPerMinute) {
                throw new TooManyRequestsException("Too many image search requests. Please wait a moment and try again.");
            }
        } catch (TooManyRequestsException e) {
            throw e;
        } catch (Exception e) {
            log.error("Rate limiter check failed for key: {}; failing open", redisKey, e);
        }
    }
}
