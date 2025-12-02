
package com.evmarketplace.Controller;

import com.evmarketplace.Pojo.APIKey;
import com.evmarketplace.Repository.APIKeyRepository;
import com.evmarketplace.Repository.UserRepository;
import com.evmarketplace.Pojo.User;
import com.evmarketplace.Service.ApiAccessService;
import com.evmarketplace.Service.RateLimitService;
import com.evmarketplace.dto.APIKeyRequestDTO;
import com.evmarketplace.dto.APIKeyResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

// cung cấp các API để quản lý API Key cho người dùng (Consumer)
@RestController
@RequestMapping("/api/apikeys") // Base path cho các endpoint quản lý API key
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}) // Cho phép frontend local truy cập
public class APIKeyController {


    // Inject các repository và service cần thiết
    private final APIKeyRepository apiKeyRepository;
    private final UserRepository userRepository;
    private final ApiAccessService apiAccessService;
    private final RateLimitService rateLimitService;

    public APIKeyController(APIKeyRepository apiKeyRepository, 
                          UserRepository userRepository,
                          ApiAccessService apiAccessService,
                          RateLimitService rateLimitService) {
        this.apiKeyRepository = apiKeyRepository;
        this.userRepository = userRepository;
        this.apiAccessService = apiAccessService;
        this.rateLimitService = rateLimitService;
    }

    /**
     * Tạo API key mới cho user hiện tại
     * - Sinh key ngẫu nhiên, gán cho user
     * - Có thể set rate limit, scope, expiry
     * - Trả về key cho user lưu trữ
     */
    @PostMapping("/generate")
    public ResponseEntity<?> generateApiKey(@Valid @RequestBody APIKeyRequestDTO request) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User not authenticated"));
            }
            
            // Generate unique API key
            String generatedKey = "evmkt_" + UUID.randomUUID().toString().replace("-", "");
            
            // Create UUID from user ID
            UUID consumerId = UUID.nameUUIDFromBytes(currentUser.getId().toString().getBytes());
            
            // Create and save the API key
            APIKey apiKey = new APIKey(consumerId, generatedKey);
            apiKey.setRateLimit(request.getRateLimit() != null ? request.getRateLimit() : 1000);
            
            // Set expiry date if provided (default: 1 year)
            if (request.getExpiryDays() != null) {
                Calendar cal = Calendar.getInstance();
                cal.add(Calendar.DAY_OF_YEAR, request.getExpiryDays());
                apiKey.setExpiryDate(cal.getTime());
            }
            
            // Set scopes
            if (request.getScopes() != null && !request.getScopes().isEmpty()) {
                apiKey.setScopes(request.getScopes());
            } else {
                apiKey.setScopes(Arrays.asList("read:datasets", "download:data"));
            }
            
            apiKeyRepository.save(apiKey);
            
            // Build response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("apiKey", generatedKey);
            response.put("keyId", apiKey.getId().toString());
            response.put("consumerId", consumerId.toString());
            response.put("rateLimit", apiKey.getRateLimit());
            response.put("scopes", apiKey.getScopes());
            response.put("expiryDate", apiKey.getExpiryDate());
            response.put("message", "API key generated successfully. Store it securely - you won't be able to see it again!");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to generate API key: " + e.getMessage()));
        }
    }
    
    /**
     * Liệt kê tất cả API key của user hiện tại
     * - Chỉ trả về key thuộc về user
     * - Ẩn giá trị key thực, chỉ show prefix
     * - Kèm usage stats 30 ngày gần nhất
     */
    @GetMapping("/list")
    public ResponseEntity<?> listApiKeys() {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User not authenticated"));
            }
            
            UUID consumerId = UUID.nameUUIDFromBytes(currentUser.getId().toString().getBytes());
            List<APIKey> keys = apiKeyRepository.findByConsumerId(consumerId);
            
            // Transform to safe response (hide actual key values)
            List<Map<String, Object>> safeKeys = keys.stream().map(key -> {
                Map<String, Object> safeKey = new HashMap<>();
                safeKey.put("id", key.getId().toString());
                safeKey.put("keyPrefix", key.getKey().substring(0, Math.min(12, key.getKey().length())) + "...");
                safeKey.put("rateLimit", key.getRateLimit());
                safeKey.put("scopes", key.getScopes());
                safeKey.put("createdAt", key.getCreatedAt());
                safeKey.put("expiryDate", key.getExpiryDate());
                safeKey.put("isExpired", key.getExpiryDate() != null && key.getExpiryDate().before(new Date()));
                
                // Get usage stats for last 30 days
                LocalDateTime since = LocalDateTime.now().minusDays(30);
                Map<String, Object> stats = apiAccessService.getUsageStatistics(key.getId(), since);
                safeKey.put("last30DaysStats", stats);
                
                return safeKey;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "keys", safeKeys,
                "totalKeys", safeKeys.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to list API keys: " + e.getMessage()));
        }
    }
    
    /**
     * Xem thống kê sử dụng của 1 API key
     * - Chỉ cho phép user sở hữu key xem
     * - Trả về số request, rate limit còn lại, v.v.
     */
    @GetMapping("/{keyId}/stats")
    public ResponseEntity<?> getApiKeyStats(
            @PathVariable String keyId,
            @RequestParam(required = false, defaultValue = "30") int days) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User not authenticated"));
            }
            
            UUID apiKeyUuid = UUID.fromString(keyId);
            Optional<APIKey> apiKeyOpt = apiKeyRepository.findById(apiKeyUuid);
            
            if (apiKeyOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "API key not found"));
            }
            
            APIKey apiKey = apiKeyOpt.get();
            
            // Verify ownership
            UUID consumerId = UUID.nameUUIDFromBytes(currentUser.getId().toString().getBytes());
            if (!apiKey.getConsumerId().equals(consumerId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied"));
            }
            
            LocalDateTime since = LocalDateTime.now().minusDays(days);
            Map<String, Object> stats = apiAccessService.getUsageStatistics(apiKey.getId(), since);
            
            // Add rate limit info
            int remaining = rateLimitService.getRemainingRequests(apiKey.getId().toString(), apiKey.getRateLimit());
            stats.put("rateLimitRemaining", remaining);
            stats.put("rateLimitMax", apiKey.getRateLimit());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "keyId", keyId,
                "period", days + " days",
                "statistics", stats
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get stats: " + e.getMessage()));
        }
    }
    
    /**
     * Thu hồi/xóa 1 API key
     * - Chỉ user sở hữu key mới xóa được
     * - Xóa khỏi database, không dùng được nữa
     */
    @DeleteMapping("/{keyId}")
    public ResponseEntity<?> revokeApiKey(@PathVariable String keyId) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User not authenticated"));
            }
            
            UUID apiKeyUuid = UUID.fromString(keyId);
            Optional<APIKey> apiKeyOpt = apiKeyRepository.findById(apiKeyUuid);
            
            if (apiKeyOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "API key not found"));
            }
            
            APIKey apiKey = apiKeyOpt.get();
            
            // Verify ownership
            UUID consumerId = UUID.nameUUIDFromBytes(currentUser.getId().toString().getBytes());
            if (!apiKey.getConsumerId().equals(consumerId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied"));
            }
            
            apiKeyRepository.delete(apiKey);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "API key revoked successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to revoke API key: " + e.getMessage()));
        }
    }
    
    /**
     * Cập nhật thông tin API key (rate limit, scope, expiry)
     * - Chỉ user sở hữu key mới update được
     * - Cho phép đổi rate limit, scope, thời hạn
     */
    @PatchMapping("/{keyId}")
    public ResponseEntity<?> updateApiKey(
            @PathVariable String keyId,
            @RequestBody Map<String, Object> updates) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User not authenticated"));
            }
            
            UUID apiKeyUuid = UUID.fromString(keyId);
            Optional<APIKey> apiKeyOpt = apiKeyRepository.findById(apiKeyUuid);
            
            if (apiKeyOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "API key not found"));
            }
            
            APIKey apiKey = apiKeyOpt.get();
            
            // Verify ownership
            UUID consumerId = UUID.nameUUIDFromBytes(currentUser.getId().toString().getBytes());
            if (!apiKey.getConsumerId().equals(consumerId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied"));
            }
            
            // Update rate limit
            if (updates.containsKey("rateLimit")) {
                apiKey.setRateLimit((Integer) updates.get("rateLimit"));
            }
            
            // Update scopes
            if (updates.containsKey("scopes")) {
                apiKey.setScopes((List<String>) updates.get("scopes"));
            }
            
            // Update expiry
            if (updates.containsKey("expiryDays")) {
                Integer expiryDays = (Integer) updates.get("expiryDays");
                Calendar cal = Calendar.getInstance();
                cal.add(Calendar.DAY_OF_YEAR, expiryDays);
                apiKey.setExpiryDate(cal.getTime());
            }
            
            apiKeyRepository.save(apiKey);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "API key updated successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update API key: " + e.getMessage()));
        }
    }
    
    // Legacy endpoint cho tương thích cũ (giữ lại cho client cũ)
    @PostMapping
    public ResponseEntity<?> generateApiKeyLegacy(@Valid @RequestBody APIKeyRequestDTO request) {
        return generateApiKey(request);
    }
    
    /**
     * Hàm tiện ích lấy user hiện tại từ context xác thực
     * - Dùng email từ authentication để tìm user
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        String currentUserEmail = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(currentUserEmail);
        return userOpt.orElse(null);
    }
}