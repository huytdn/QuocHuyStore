package com.quochuystore.backend.config;

public final class CacheKeyConstants {
    private CacheKeyConstants() {
        // Prevent instantiation
    }

    public static final String PRODUCT_SLUG_PREFIX = "qhs:products:slug:";
    public static final long PRODUCT_CACHE_TTL_MINUTES = 120;

    public static final String CATEGORY_ALL_KEY = "qhs:categories:all";
    public static final long CATEGORY_CACHE_TTL_HOURS = 24;

    public static final String USER_LIKES_PREFIX = "qhs:users:likes:";
    public static final long USER_LIKES_TTL_HOURS = 24;

    public static final String CHAT_ROOM_PREFIX = "qhs:chat:room:";
    public static final int CHAT_ROOM_BUFFER_SIZE = 50;
    public static final long CHAT_ROOM_TTL_HOURS = 1;

    public static final String VOUCHER_PUBLIC_KEY = "qhs:vouchers:public";
    public static final long VOUCHER_PUBLIC_TTL_MINUTES = 5;
}
