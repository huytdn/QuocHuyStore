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

    public static final String DASHBOARD_KPI_PREFIX = "qhs:admin:dashboard:kpis:";
    public static final long DASHBOARD_KPI_TTL_MINUTES = 2;

    public static final String DASHBOARD_REVENUE_PREFIX = "qhs:admin:dashboard:revenue:";
    public static final long DASHBOARD_REVENUE_TTL_MINUTES = 5;

    public static final String DASHBOARD_ORDER_ANALYTICS_PREFIX = "qhs:admin:dashboard:orders:";
    public static final long DASHBOARD_ORDER_ANALYTICS_TTL_MINUTES = 5;

    public static final String DASHBOARD_TOP_PRODUCTS_PREFIX = "qhs:admin:dashboard:top_products:";
    public static final long DASHBOARD_TOP_PRODUCTS_TTL_MINUTES = 15;

    public static final String DASHBOARD_CATEGORY_REVENUE_PREFIX = "qhs:admin:dashboard:cat_revenue:";
    public static final long DASHBOARD_CATEGORY_REVENUE_TTL_MINUTES = 15;

    public static final String DASHBOARD_LOW_STOCK_PREFIX = "qhs:admin:dashboard:low_stock:";
    public static final long DASHBOARD_LOW_STOCK_TTL_MINUTES = 2;

    public static final String USER_ANALYTICS_SUMMARY_PREFIX = "qhs:admin:users:summary:";
    public static final long USER_ANALYTICS_SUMMARY_TTL_MINUTES = 5;
}
