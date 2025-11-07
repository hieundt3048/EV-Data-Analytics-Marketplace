package com.evmarketplace.Controller;

import com.evmarketplace.Service.AIAnalyticsService;
import com.evmarketplace.dto.AISuggestionsDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:5173")
public class AnalyticsController {

    private final AIAnalyticsService aiAnalyticsService;

    public AnalyticsController(AIAnalyticsService aiAnalyticsService) {
        this.aiAnalyticsService = aiAnalyticsService;
    }

    @GetMapping("/ai-suggestions")
    public ResponseEntity<AISuggestionsDTO> getAISuggestions(
            @RequestParam(defaultValue = "demo") String datasetId,
            @RequestParam(defaultValue = "general") String analysisType) {

        try {
            AISuggestionsDTO suggestions = aiAnalyticsService.getAISuggestions(datasetId, analysisType);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/batch-suggestions")
    public ResponseEntity<Map<String, AISuggestionsDTO>> getBatchAISuggestions(
            @RequestBody Map<String, Object> request) {

        try {
            @SuppressWarnings("unchecked")
            List<String> datasetIds = (List<String>) request.get("datasetIds");
            String analysisType = (String) request.getOrDefault("analysisType", "general");

            Map<String, AISuggestionsDTO> results = aiAnalyticsService.getBatchSuggestions(datasetIds, analysisType);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
