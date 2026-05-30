package com.quochuystore.backend.config;

public final class CacheKeyConstants {
    private CacheKeyConstants() {
        // Prevent instantiation
    }

    public static final String PRODUCT_SLUG_PREFIX = "qhs:products:slug:";
    public static final long PRODUCT_CACHE_TTL_MINUTES = 120;
    
    public static final String CATEGORY_ALL_KEY = "qhs:categories:all";
    public static final long CATEGORY_CACHE_TTL_HOURS = 24;
}
