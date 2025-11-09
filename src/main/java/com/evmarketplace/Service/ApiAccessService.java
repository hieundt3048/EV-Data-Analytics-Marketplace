package com.evmarketplace.Service;

import com.evmarketplace.Pojo.APIKey;
import com.evmarketplace.Pojo.ApiUsageLog;
import com.evmarketplace.Repository.ApiUsageLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ApiAccessService {
    
    private final ApiUsageLogRepository usageLogRepository;
    private final RateLimitService rateLimitService;
    
    public ApiAccessService(ApiUsageLogRepository usageLogRepository, 
                           RateLimitService rateLimitService) {
        this.usageLogRepository = usageLogRepository;
        this.rateLimitService = rateLimitService;
    }
    
    /**
     * Log API request for usage tracking and analytics
     */
    @Transactional
    public void logApiRequest(APIKey apiKey, HttpServletRequest request, 
                             int statusCode, long responseTimeMs) {
        ApiUsageLog log = new ApiUsageLog();
        log.setApiKeyId(apiKey.getId().getMostSignificantBits()); // Convert UUID to Long for simplicity
        log.setEndpoint(request.getRequestURI());
        log.setMethod(request.getMethod());
        log.setStatusCode(statusCode);
        log.setResponseTimeMs(responseTimeMs);
        log.setIpAddress(getClientIpAddress(request));
        log.setUserAgent(request.getHeader("User-Agent"));
        
        usageLogRepository.save(log);
    }
    
    /**
     * Log API request with error
     */
    @Transactional
    public void logApiError(APIKey apiKey, HttpServletRequest request, 
                           int statusCode, String errorMessage) {
        ApiUsageLog log = new ApiUsageLog();
        log.setApiKeyId(apiKey.getId().getMostSignificantBits());
        log.setEndpoint(request.getRequestURI());
        log.setMethod(request.getMethod());
        log.setStatusCode(statusCode);
        log.setErrorMessage(errorMessage);
        log.setIpAddress(getClientIpAddress(request));
        
        usageLogRepository.save(log);
    }
    
    /**
     * Log data download for bandwidth tracking
     */
    @Transactional
    public void logDataDownload(APIKey apiKey, Long datasetId, long bytesTransferred) {
        ApiUsageLog log = new ApiUsageLog();
        log.setApiKeyId(apiKey.getId().getMostSignificantBits());
        log.setEndpoint("/api/datasets/" + datasetId + "/download");
        log.setMethod("GET");
        log.setStatusCode(200);
        log.setDatasetId(datasetId);
        log.setBytesTransferred(bytesTransferred);
        
        usageLogRepository.save(log);
    }
    
    /**
     * Get usage statistics for an API key
     */
    public Map<String, Object> getUsageStatistics(UUID apiKeyId, LocalDateTime since) {
        Long apiKeyLongId = apiKeyId.getMostSignificantBits();
        
        Map<String, Object> stats = new HashMap<>();
        
        // Total requests
        Long totalRequests = usageLogRepository.countRequestsSince(apiKeyLongId, since);
        stats.put("totalRequests", totalRequests);
        
        // Get requests by time period
        List<ApiUsageLog> logs = usageLogRepository.findByApiKeyIdAndTimestampBetween(
            apiKeyLongId, since, LocalDateTime.now()
        );
        
        // Calculate success rate
        long successfulRequests = logs.stream().filter(l -> l.getStatusCode() >= 200 && l.getStatusCode() < 300).count();
        double successRate = logs.isEmpty() ? 0 : (double) successfulRequests / logs.size() * 100;
        stats.put("successRate", Math.round(successRate * 100.0) / 100.0);
        
        // Calculate average response time
        double avgResponseTime = logs.stream()
            .filter(l -> l.getResponseTimeMs() != null)
            .mapToLong(ApiUsageLog::getResponseTimeMs)
            .average()
            .orElse(0.0);
        stats.put("avgResponseTimeMs", Math.round(avgResponseTime));
        
        // Get top endpoints
        List<Object[]> topEndpoints = usageLogRepository.getTopEndpoints(apiKeyLongId);
        stats.put("topEndpoints", topEndpoints);
        
        // Calculate total bandwidth
        long totalBandwidth = logs.stream()
            .filter(l -> l.getBytesTransferred() != null)
            .mapToLong(ApiUsageLog::getBytesTransferred)
            .sum();
        stats.put("totalBandwidthBytes", totalBandwidth);
        stats.put("totalBandwidthMB", Math.round(totalBandwidth / (1024.0 * 1024.0) * 100.0) / 100.0);
        
        // Error count
        long errorCount = logs.stream().filter(l -> l.getStatusCode() >= 400).count();
        stats.put("errorCount", errorCount);
        
        return stats;
    }
    
    /**
     * Check if API key has specific scope/permission
     */
    public boolean hasScope(APIKey apiKey, String requiredScope) {
        return apiKey.getScopes() != null && apiKey.getScopes().contains(requiredScope);
    }
    
    /**
     * Validate API key and check rate limit
     */
    public boolean validateApiAccess(APIKey apiKey, String ipAddress) {
        // Check if key is expired
        if (apiKey.getExpiryDate() != null && apiKey.getExpiryDate().before(new Date())) {
            return false;
        }
        
        // Check rate limit
        if (!rateLimitService.allowRequest(apiKey.getId().toString())) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Extract client IP address from request
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIP = request.getHeader("X-Real-IP");
        if (xRealIP != null && !xRealIP.isEmpty()) {
            return xRealIP;
        }
        
        return request.getRemoteAddr();
    }
}
