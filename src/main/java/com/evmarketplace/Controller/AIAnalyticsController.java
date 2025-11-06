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
public class AIAnalyticsController {

    private final AIAnalyticsService aiAnalyticsService;

    public AIAnalyticsController(AIAnalyticsService aiAnalyticsService) {
        this.aiAnalyticsService = aiAnalyticsService;
    }

    @GetMapping("/suggestions")
    public ResponseEntity<AISuggestionsDTO> getAISuggestions(
            @RequestParam String datasetId,
            @RequestParam(defaultValue = "general") String analysisType) {
        
        try {
            AISuggestionsDTO suggestions = aiAnalyticsService.getAISuggestions(datasetId, analysisType);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/suggestions/batch")
    public ResponseEntity<Map<String, AISuggestionsDTO>> getBatchSuggestions(
            @RequestBody List<String> datasetIds,
            @RequestParam(defaultValue = "general") String analysisType) {
        
        try {
            Map<String, AISuggestionsDTO> batchResults = aiAnalyticsService.getBatchSuggestions(datasetIds, analysisType);
            return ResponseEntity.ok(batchResults);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/suggestions/stream")
    public ResponseEntity<AISuggestionsDTO> getStreamingSuggestions(
            @RequestParam String datasetId,
            @RequestParam(defaultValue = "general") String analysisType) {
        
        try {
            AISuggestionsDTO suggestions = aiAnalyticsService.getStreamingSuggestions(datasetId, analysisType).block();
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> healthStatus = Map.of(
            "status", "healthy",
            "service", "AI Analytics",
            "timestamp", java.time.LocalDateTime.now().toString()
        );
        return ResponseEntity.ok(healthStatus);
    }
}