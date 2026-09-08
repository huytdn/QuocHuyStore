package com.quochuystore.backend.service;

public interface RateLimiterService {
    /**
     * Throws TooManyRequestsException if {@code key} has exceeded its per-minute quota.
     * Fails open (never throws for infrastructure reasons) if Redis itself is unreachable.
     */
    void checkRateLimit(String key);
}
