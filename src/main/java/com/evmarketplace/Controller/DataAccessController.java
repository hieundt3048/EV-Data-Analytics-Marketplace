package com.evmarketplace.Controller;

import com.evmarketplace.Pojo.APIKey;
import com.evmarketplace.Pojo.Dataset;
import com.evmarketplace.Repository.DatasetRepository;
import com.evmarketplace.Service.ApiAccessService;
import com.evmarketplace.Service.RateLimitService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Controller cho phép bên thứ ba truy cập dữ liệu EV thông qua API key
 * Endpoint: /api/v1/** (được bảo vệ bởi ApiKeyFilter)
 */
@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class DataAccessController {

    private final DatasetRepository datasetRepository;
    private final ApiAccessService apiAccessService;
    private final RateLimitService rateLimitService;

    public DataAccessController(
            DatasetRepository datasetRepository,
            ApiAccessService apiAccessService,
            RateLimitService rateLimitService) {
        this.datasetRepository = datasetRepository;
        this.apiAccessService = apiAccessService;
        this.rateLimitService = rateLimitService;
    }

    /**
     * Lấy danh sách tất cả datasets công khai
     * GET /api/v1/datasets
     * Header: X-API-Key: evmkt_xxx
     */
    @GetMapping("/datasets")
    public ResponseEntity<?> getDatasets(HttpServletRequest request) {
        APIKey apiKey = (APIKey) request.getAttribute("apiKey");
        if (apiKey == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid API key"));
        }

        // Kiểm tra rate limit
        if (!rateLimitService.allowRequest(apiKey.getId().toString(), apiKey.getRateLimit())) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(Map.of("error", "Rate limit exceeded"));
        }

        // Kiểm tra scope
        if (!hasScope(apiKey, "read:datasets")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Insufficient permissions"));
        }

        // Kiểm tra API key đã hết hạn chưa
        if (apiKey.getExpiryDate() != null && apiKey.getExpiryDate().before(new Date())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "API key has expired"));
        }

        try {
            // Lấy danh sách datasets
            List<Dataset> datasets = datasetRepository.findAll();
            
            // Chuyển đổi sang response format
            List<Map<String, Object>> response = datasets.stream().map(ds -> {
                Map<String, Object> data = new HashMap<>();
                data.put("id", ds.getId());
                data.put("title", ds.getTitle());
                data.put("description", ds.getDescription());
                data.put("category", ds.getCategory());
                data.put("dataType", ds.getDataType());
                data.put("size", ds.getSize());
                data.put("price", ds.getPrice());
                data.put("createdAt", ds.getCreatedAt());
                data.put("tags", ds.getTags());
                return data;
            }).collect(Collectors.toList());

            // Log truy cập
            apiAccessService.logAccess(apiKey.getId(), "/api/v1/datasets", "GET", true);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", response,
                "count", response.size(),
                "rateLimitRemaining", rateLimitService.getRemainingRequests(
                    apiKey.getId().toString(), apiKey.getRateLimit())
            ));
        } catch (Exception e) {
            apiAccessService.logAccess(apiKey.getId(), "/api/v1/datasets", "GET", false);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve datasets: " + e.getMessage()));
        }
    }

    /**
     * Lấy chi tiết một dataset
     * GET /api/v1/datasets/{id}
     * Header: X-API-Key: evmkt_xxx
     */
    @GetMapping("/datasets/{id}")
    public ResponseEntity<?> getDatasetDetails(
            @PathVariable Long id,
            HttpServletRequest request) {
        APIKey apiKey = (APIKey) request.getAttribute("apiKey");
        if (apiKey == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid API key"));
        }

        // Kiểm tra rate limit
        if (!rateLimitService.allowRequest(apiKey.getId().toString(), apiKey.getRateLimit())) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(Map.of("error", "Rate limit exceeded"));
        }

        // Kiểm tra scope
        if (!hasScope(apiKey, "read:datasets")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Insufficient permissions"));
        }

        // Kiểm tra API key đã hết hạn chưa
        if (apiKey.getExpiryDate() != null && apiKey.getExpiryDate().before(new Date())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "API key has expired"));
        }

        try {
            Optional<Dataset> datasetOpt = datasetRepository.findById(id);
            if (datasetOpt.isEmpty()) {
                apiAccessService.logAccess(apiKey.getId(), "/api/v1/datasets/" + id, "GET", false);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Dataset not found"));
            }

            Dataset ds = datasetOpt.get();
            Map<String, Object> data = new HashMap<>();
            data.put("id", ds.getId());
            data.put("title", ds.getTitle());
            data.put("description", ds.getDescription());
            data.put("category", ds.getCategory());
            data.put("dataType", ds.getDataType());
            data.put("size", ds.getSize());
            data.put("price", ds.getPrice());
            data.put("createdAt", ds.getCreatedAt());
            data.put("tags", ds.getTags());
            data.put("region", ds.getRegion());
            data.put("vehicleType", ds.getVehicleType());
            data.put("collectionDate", ds.getCollectionDate());

            // Log truy cập
            apiAccessService.logAccess(apiKey.getId(), "/api/v1/datasets/" + id, "GET", true);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", data,
                "rateLimitRemaining", rateLimitService.getRemainingRequests(
                    apiKey.getId().toString(), apiKey.getRateLimit())
            ));
        } catch (Exception e) {
            apiAccessService.logAccess(apiKey.getId(), "/api/v1/datasets/" + id, "GET", false);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve dataset: " + e.getMessage()));
        }
    }

    /**
     * Download dataset (chỉ cho phép nếu có scope download:data)
     * GET /api/v1/datasets/{id}/download
     * Header: X-API-Key: evmkt_xxx
     */
    @GetMapping("/datasets/{id}/download")
    public ResponseEntity<?> downloadDataset(
            @PathVariable Long id,
            HttpServletRequest request) {
        APIKey apiKey = (APIKey) request.getAttribute("apiKey");
        if (apiKey == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid API key"));
        }

        // Kiểm tra rate limit
        if (!rateLimitService.allowRequest(apiKey.getId().toString(), apiKey.getRateLimit())) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(Map.of("error", "Rate limit exceeded"));
        }

        // Kiểm tra scope download
        if (!hasScope(apiKey, "download:data")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Download permission required"));
        }

        // Kiểm tra API key đã hết hạn chưa
        if (apiKey.getExpiryDate() != null && apiKey.getExpiryDate().before(new Date())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "API key has expired"));
        }

        try {
            Optional<Dataset> datasetOpt = datasetRepository.findById(id);
            if (datasetOpt.isEmpty()) {
                apiAccessService.logAccess(apiKey.getId(), "/api/v1/datasets/" + id + "/download", "GET", false);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Dataset not found"));
            }

            Dataset ds = datasetOpt.get();
            
            // Log truy cập
            apiAccessService.logAccess(apiKey.getId(), "/api/v1/datasets/" + id + "/download", "GET", true);

            // Trả về thông tin download
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Download initiated",
                "datasetId", ds.getId(),
                "title", ds.getTitle(),
                "dataType", ds.getDataType(),
                "size", ds.getSize(),
                "rateLimitRemaining", rateLimitService.getRemainingRequests(
                    apiKey.getId().toString(), apiKey.getRateLimit())
            ));
        } catch (Exception e) {
            apiAccessService.logAccess(apiKey.getId(), "/api/v1/datasets/" + id + "/download", "GET", false);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to download dataset: " + e.getMessage()));
        }
    }

    /**
     * Lấy thống kê analytics (chỉ cho phép nếu có scope analytics:access)
     * GET /api/v1/analytics
     * Header: X-API-Key: evmkt_xxx
     */
    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics(HttpServletRequest request) {
        APIKey apiKey = (APIKey) request.getAttribute("apiKey");
        if (apiKey == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid API key"));
        }

        // Kiểm tra rate limit
        if (!rateLimitService.allowRequest(apiKey.getId().toString(), apiKey.getRateLimit())) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(Map.of("error", "Rate limit exceeded"));
        }

        // Kiểm tra scope analytics
        if (!hasScope(apiKey, "analytics:access")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Analytics permission required"));
        }

        // Kiểm tra API key đã hết hạn chưa
        if (apiKey.getExpiryDate() != null && apiKey.getExpiryDate().before(new Date())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "API key has expired"));
        }

        try {
            // Tạo analytics data
            Map<String, Object> analytics = new HashMap<>();
            analytics.put("totalDatasets", datasetRepository.count());
            analytics.put("categories", Arrays.asList("EV Sales", "Charging Stations", "Battery Data", "Market Analysis"));
            analytics.put("timestamp", new Date());

            // Log truy cập
            apiAccessService.logAccess(apiKey.getId(), "/api/v1/analytics", "GET", true);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", analytics,
                "rateLimitRemaining", rateLimitService.getRemainingRequests(
                    apiKey.getId().toString(), apiKey.getRateLimit())
            ));
        } catch (Exception e) {
            apiAccessService.logAccess(apiKey.getId(), "/api/v1/analytics", "GET", false);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve analytics: " + e.getMessage()));
        }
    }

    /**
     * Health check endpoint (không cần scope đặc biệt)
     * GET /api/v1/health
     * Header: X-API-Key: evmkt_xxx
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck(HttpServletRequest request) {
        APIKey apiKey = (APIKey) request.getAttribute("apiKey");
        if (apiKey == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid API key"));
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "status", "healthy",
            "timestamp", new Date(),
            "apiKeyValid", true
        ));
    }

    /**
     * Helper method kiểm tra scope
     */
    private boolean hasScope(APIKey apiKey, String requiredScope) {
        List<String> scopes = apiKey.getScopes();
        return scopes != null && scopes.contains(requiredScope);
    }
}
