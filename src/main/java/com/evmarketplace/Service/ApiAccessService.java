package com.evmarketplace.Service;

import com.evmarketplace.Pojo.APIKey;
import com.evmarketplace.Pojo.ApiUsageLog;
import com.evmarketplace.Repository.ApiUsageLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Service quản lý truy cập API và theo dõi sử dụng
 * Xử lý: logging API requests, tracking usage, kiểm tra rate limit, quản lý permissions
 * Tích hợp với RateLimitService để giới hạn số requests và ApiUsageLogRepository để lưu logs
 */
@Service
public class ApiAccessService {
    
    private final ApiUsageLogRepository usageLogRepository;
    private final RateLimitService rateLimitService;
    
    /**
     * Constructor injection - khởi tạo dependencies
     * @param usageLogRepository Repository để lưu trữ logs sử dụng API
     * @param rateLimitService Service quản lý giới hạn tần suất truy cập
     */
    public ApiAccessService(ApiUsageLogRepository usageLogRepository, 
                           RateLimitService rateLimitService) {
        this.usageLogRepository = usageLogRepository;
        this.rateLimitService = rateLimitService;
    }
    
    /**
     * Ghi log API request để theo dõi và phân tích sử dụng
     * Lưu thông tin đầy đủ: endpoint, method, status code, response time, IP address, user agent
     * 
     * @param apiKey API key được sử dụng cho request
     * @param request HTTP request object chứa thông tin request
     * @param statusCode HTTP status code của response (200, 404, 500...)
     * @param responseTimeMs Thời gian xử lý request (milliseconds)
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
     * Ghi log truy cập đơn giản (chỉ endpoint và status)
     * Phiên bản rút gọn của logApiRequest, dùng khi không có HttpServletRequest object
     * 
     * @param apiKeyId ID của API key được sử dụng
     * @param endpoint Đường dẫn API được gọi (ví dụ: /api/datasets)
     * @param method HTTP method (GET, POST, PUT, DELETE)
     * @param success True nếu request thành công (status 200), false nếu lỗi (status 500)
     */
    @Transactional
    public void logAccess(UUID apiKeyId, String endpoint, String method, boolean success) {
        ApiUsageLog log = new ApiUsageLog();
        log.setApiKeyId(apiKeyId.getMostSignificantBits());
        log.setEndpoint(endpoint);
        log.setMethod(method);
        log.setStatusCode(success ? 200 : 500);
        
        usageLogRepository.save(log);
    }
    
    /**
     * Ghi log API request khi có lỗi xảy ra
     * Lưu thông tin lỗi chi tiết để debug và phân tích
     * 
     * @param apiKey API key được sử dụng cho request
     * @param request HTTP request object chứa thông tin request
     * @param statusCode HTTP error status code (400, 401, 403, 404, 500...)
     * @param errorMessage Thông báo lỗi chi tiết
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
     * Ghi log khi tải dataset để theo dõi băng thông sử dụng
     * Tính toán chi phí bandwidth và giám sát lưu lượng dữ liệu
     * 
     * @param apiKey API key được sử dụng để tải dữ liệu
     * @param datasetId ID của dataset được tải
     * @param bytesTransferred Số bytes đã truyền tải (dung lượng file)
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
     * Lấy thống kê sử dụng chi tiết cho một API key
     * Bao gồm: tổng requests, success rate, avg response time, top endpoints, bandwidth, error count
     * 
     * @param apiKeyId ID của API key cần lấy thống kê
     * @param since Thời điểm bắt đầu tính thống kê (LocalDateTime)
     * @return Map chứa các metrics: totalRequests, successRate, avgResponseTimeMs, topEndpoints, totalBandwidthMB, errorCount
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
     * Kiểm tra xem API key có quyền (scope) cụ thể hay không
     * Scopes định nghĩa các permissions như: read:datasets, write:datasets, admin:all
     * 
     * @param apiKey API key cần kiểm tra quyền
     * @param requiredScope Scope/permission yêu cầu (ví dụ: "read:datasets")
     * @return true nếu API key có scope này, false nếu không có
     */
    public boolean hasScope(APIKey apiKey, String requiredScope) {
        return apiKey.getScopes() != null && apiKey.getScopes().contains(requiredScope);
    }
    
    /**
     * Validate API key và kiểm tra giới hạn tần suất truy cập (rate limit)
     * Kiểm tra 2 điều kiện: (1) key chưa hết hạn, (2) chưa vượt quá rate limit
     * 
     * @param apiKey API key cần validate
     * @param ipAddress Địa chỉ IP của client (dùng cho rate limiting)
     * @return true nếu API key hợp lệ và chưa vượt rate limit, false nếu không hợp lệ hoặc vượt giới hạn
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
     * Trích xuất địa chỉ IP thực của client từ HTTP request
     * Xử lý các trường hợp: proxy (X-Forwarded-For), load balancer (X-Real-IP), direct connection
     * 
     * @param request HTTP request object
     * @return Địa chỉ IP của client (ưu tiên X-Forwarded-For, sau đó X-Real-IP, cuối cùng RemoteAddr)
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
