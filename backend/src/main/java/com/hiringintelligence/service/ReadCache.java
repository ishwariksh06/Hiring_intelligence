package com.hiringintelligence.service;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

/**
 * Tiny time-boxed cache for read-heavy endpoints (dashboard, analytics, lists).
 * Every write path calls {@link #clear()}, so readers never see stale data for longer than a write takes.
 * The TTL is a safety net in case a write path is missed.
 */
@Component
public class ReadCache {

    private static final long TTL_MILLIS = 300_000;

    private record Entry(Object value, long expiresAt) {}

    private final Map<String, Entry> entries = new ConcurrentHashMap<>();

    @SuppressWarnings("unchecked")
    public <T> T get(String key, Supplier<T> loader) {
        long now = System.currentTimeMillis();
        Entry hit = entries.get(key);
        if (hit != null && hit.expiresAt() > now) {
            return (T) hit.value();
        }
        T value = loader.get();
        entries.put(key, new Entry(value, now + TTL_MILLIS));
        return value;
    }

    /** Cache key that separates admin (agency-wide) data from each client company. */
    public static String key(String name, com.hiringintelligence.security.AppPrincipal principal) {
        return name + "|" + (principal.isAdmin() ? "ADMIN" : principal.companyId());
    }

    public void clear() {
        entries.clear();
    }
}
