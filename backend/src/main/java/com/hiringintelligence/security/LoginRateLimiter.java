package com.hiringintelligence.security;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Blocks repeated failed logins. After {@link #MAX_FAILURES} failures for the same
 * client + email inside {@link #WINDOW}, further attempts are refused until the window passes.
 * A successful login clears the counter.
 */
@Component
public class LoginRateLimiter {

    public static final int MAX_FAILURES = 5;
    static final Duration WINDOW = Duration.ofMinutes(15);

    private static final class Attempts {
        int failures;
        long windowStart;
    }

    private final Map<String, Attempts> attempts = new ConcurrentHashMap<>();

    private static String key(String clientId, String email) {
        return clientId + "|" + (email == null ? "" : email.trim().toLowerCase());
    }

    /** @return seconds until the caller may retry, or 0 when the attempt is allowed. */
    public long retryAfterSeconds(String clientId, String email) {
        Attempts a = attempts.get(key(clientId, email));
        if (a == null) {
            return 0;
        }
        synchronized (a) {
            long now = System.currentTimeMillis();
            long elapsed = now - a.windowStart;
            if (elapsed >= WINDOW.toMillis()) {
                attempts.remove(key(clientId, email));
                return 0;
            }
            return a.failures >= MAX_FAILURES ? Math.max(1, (WINDOW.toMillis() - elapsed) / 1000) : 0;
        }
    }

    public void recordFailure(String clientId, String email) {
        Attempts a = attempts.computeIfAbsent(key(clientId, email), k -> new Attempts());
        synchronized (a) {
            long now = System.currentTimeMillis();
            if (a.failures == 0 || now - a.windowStart >= WINDOW.toMillis()) {
                a.failures = 0;
                a.windowStart = now;
            }
            a.failures++;
        }
    }

    public void recordSuccess(String clientId, String email) {
        attempts.remove(key(clientId, email));
    }
}
