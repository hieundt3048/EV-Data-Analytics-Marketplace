package com.evmarketplace.Service;

import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Rate limiting service to prevent API abuse
 * Uses sliding window algorithm with in-memory storage (can be upgraded to Redis)
 */
@Service
public class RateLimitService {
    
    // In-memory rate limit cache: apiKeyId -> RequestCounter
    private final ConcurrentHashMap<String, RequestCounter> requestCounts = new ConcurrentHashMap<>();
    
    // Default rate limit: 100 requests per minute
    private static final int DEFAULT_RATE_LIMIT = 100;
    private static final long WINDOW_SIZE_MS = 60000; // 1 minute
    
    /**
     * Check if request is allowed under rate limit
     * @param apiKeyId API key identifier
     * @return true if request is allowed, false if rate limit exceeded
     */
    public boolean allowRequest(String apiKeyId) {
        return allowRequest(apiKeyId, DEFAULT_RATE_LIMIT);
    }
    
    /**
     * Check if request is allowed with custom rate limit
     * @param apiKeyId API key identifier
     * @param rateLimit Max requests per minute
     * @return true if request is allowed, false if rate limit exceeded
     */
    public boolean allowRequest(String apiKeyId, int rateLimit) {
        RequestCounter counter = requestCounts.computeIfAbsent(apiKeyId, k -> new RequestCounter());
        
        long currentTime = System.currentTimeMillis();
        
        synchronized (counter) {
            // Reset counter if window has expired
            if (currentTime - counter.windowStart >= WINDOW_SIZE_MS) {
                counter.reset(currentTime);
            }
            
            // Check if under limit
            if (counter.count.get() < rateLimit) {
                counter.count.incrementAndGet();
                return true;
            }
            
            return false;
        }
    }
    
    /**
     * Get current request count for an API key
     */
    public int getCurrentCount(String apiKeyId) {
        RequestCounter counter = requestCounts.get(apiKeyId);
        return counter != null ? counter.count.get() : 0;
    }
    
    /**
     * Get remaining requests for an API key
     */
    public int getRemainingRequests(String apiKeyId, int rateLimit) {
        int current = getCurrentCount(apiKeyId);
        return Math.max(0, rateLimit - current);
    }
    
    /**
     * Reset rate limit for an API key (useful for testing)
     */
    public void reset(String apiKeyId) {
        requestCounts.remove(apiKeyId);
    }
    
    /**
     * Clean up expired counters (should be called periodically)
     */
    public void cleanupExpired() {
        long currentTime = System.currentTimeMillis();
        requestCounts.entrySet().removeIf(entry -> 
            currentTime - entry.getValue().windowStart >= WINDOW_SIZE_MS * 2
        );
    }
    
    /**
     * Internal class to track request counts per time window
     */
    private static class RequestCounter {
        private final AtomicInteger count = new AtomicInteger(0);
        private long windowStart;
        
        public RequestCounter() {
            this.windowStart = System.currentTimeMillis();
        }
        
        public void reset(long newWindowStart) {
            this.count.set(0);
            this.windowStart = newWindowStart;
        }
    }
}
