package com.evmarketplace.Controller;

import com.evmarketplace.Service.AIAnalyticsService;
import com.evmarketplace.dto.AISuggestionsDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller xử lý các API liên quan đến phân tích dữ liệu sử dụng AI.
 * Cung cấp endpoints để lấy gợi ý phân tích từ AI cho dataset.
 */
@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:5173") // Cho phép CORS từ frontend React
public class AnalyticsController {

    private final AIAnalyticsService aiAnalyticsService;

    // Constructor injection: Spring tự động inject AIAnalyticsService
    public AnalyticsController(AIAnalyticsService aiAnalyticsService) {
        this.aiAnalyticsService = aiAnalyticsService;
    }

    /**
     * Lấy gợi ý phân tích AI cho một dataset.
     * @param datasetId ID của dataset cần phân tích (mặc định: "demo").
     * @param analysisType Loại phân tích (mặc định: "general").
     * @return AISuggestionsDTO chứa các gợi ý phân tích từ AI.
     */
    @GetMapping("/ai-suggestions")
    public ResponseEntity<AISuggestionsDTO> getAISuggestions(
            @RequestParam(defaultValue = "demo") String datasetId,
            @RequestParam(defaultValue = "general") String analysisType) {

        try {
            // Gọi service để lấy AI suggestions
            AISuggestionsDTO suggestions = aiAnalyticsService.getAISuggestions(datasetId, analysisType);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            // Trả về 400 Bad Request nếu có lỗi
            return ResponseEntity.badRequest().body(null);
        }
    }

    /**
     * Lấy gợi ý phân tích AI cho nhiều datasets cùng lúc.
     * @param request Map chứa danh sách datasetIds và analysisType.
     * @return Map với key là datasetId, value là AISuggestionsDTO.
     */
    @PostMapping("/batch-suggestions")
    public ResponseEntity<Map<String, AISuggestionsDTO>> getBatchAISuggestions(
            @RequestBody Map<String, Object> request) {

        try {
            // Lấy danh sách dataset IDs từ request body
            @SuppressWarnings("unchecked")
            List<String> datasetIds = (List<String>) request.get("datasetIds");
            String analysisType = (String) request.getOrDefault("analysisType", "general");

            // Gọi service để lấy batch suggestions
            Map<String, AISuggestionsDTO> results = aiAnalyticsService.getBatchSuggestions(datasetIds, analysisType);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            // Trả về 400 Bad Request nếu có lỗi
            return ResponseEntity.badRequest().body(null);
        }
    }
}
