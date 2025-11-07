package com.evmarketplace.Service;

import com.evmarketplace.dto.AISuggestionsDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class AIAnalyticsService {

    private final WebClient webClient;
    
    @Value("${ai.service.url:https://api.openai.com/v1/chat/completions}")
    private String aiServiceUrl;
    
    @Value("${ai.service.api-key:demo-key}")
    private String apiKey;

    public AIAnalyticsService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .baseUrl(aiServiceUrl)
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AIAnalyticsService.class);

    public AISuggestionsDTO getAISuggestions(String datasetId, String analysisType) {
        try {
            // Nếu có AI service thật, gọi API thật
            if (!"demo-key".equals(apiKey)) {
                return callRealAIService(datasetId, analysisType);
            } else {
                // Trả về dữ liệu demo
                return generateDemoSuggestions(datasetId, analysisType);
            }
        } catch (Exception e) {
            // Fallback to demo data
            return generateDemoSuggestions(datasetId, analysisType);
        }
    }

    private AISuggestionsDTO callRealAIService(String datasetId, String analysisType) {
        // Implementation for real AI service call
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("dataset_id", datasetId);
        requestBody.put("analysis_type", analysisType);
        requestBody.put("prompt", generateAIPrompt(datasetId, analysisType));

        try {
            AISuggestionsDTO response = webClient.post()
                    .uri("/analyze")
                    .header("Authorization", "Bearer " + apiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(AISuggestionsDTO.class)
                    .block();

            return response != null ? response : generateDemoSuggestions(datasetId, analysisType);
            
        } catch (WebClientResponseException e) {
            logger.warn("AI Service error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            return generateDemoSuggestions(datasetId, analysisType);
        }
    }

    private AISuggestionsDTO generateDemoSuggestions(String datasetId, String analysisType) {
        AISuggestionsDTO suggestions = new AISuggestionsDTO();
        suggestions.setDatasetId(datasetId);
        suggestions.setAnalysisSummary("AI analysis of dataset " + datasetId + " focusing on " + analysisType);
        suggestions.setConfidenceScore(0.85);
        suggestions.setGeneratedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        
        List<AISuggestionsDTO.Suggestion> suggestionList = new ArrayList<>();
        
        // Thêm các suggestions demo
        if ("performance".equals(analysisType)) {
            suggestionList.add(createSuggestion(
                "trend", 
                "Revenue Growth Trend", 
                "Dataset shows 15% month-over-month growth in Asian markets", 
                "high",
                0.92
            ));
            
            suggestionList.add(createSuggestion(
                "recommendation", 
                "Expand European Coverage", 
                "Consider adding more data points from European EV markets to capture emerging trends", 
                "medium",
                0.78
            ));
        } else if ("anomaly".equals(analysisType)) {
            suggestionList.add(createSuggestion(
                "anomaly", 
                "Unusual Activity Detected", 
                "Spike in data access requests from new geographic regions detected", 
                "high",
                0.95
            ));
        } else {
            // General analysis
            suggestionList.add(createSuggestion(
                "insight", 
                "Peak Usage Patterns", 
                "Data consumption peaks between 9-11 AM and 2-4 PM local time", 
                "medium",
                0.87
            ));
            
            suggestionList.add(createSuggestion(
                "recommendation", 
                "Optimize Data Delivery", 
                "Implement caching for frequently accessed data segments to improve performance", 
                "medium",
                0.81
            ));
        }
        
        suggestions.setSuggestions(suggestionList);
        return suggestions;
    }

    private AISuggestionsDTO.Suggestion createSuggestion(String type, String title, String description, String impact, Double confidence) {
        AISuggestionsDTO.Suggestion suggestion = new AISuggestionsDTO.Suggestion();
        suggestion.setType(type);
        suggestion.setTitle(title);
        suggestion.setDescription(description);
        suggestion.setImpact(impact);
        suggestion.setConfidence(confidence);
        
        // Add suggested actions
        List<String> actions = new ArrayList<>();
        if ("recommendation".equals(type)) {
            actions.add("Review current data coverage");
            actions.add("Analyze market potential");
            actions.add("Plan implementation timeline");
        } else if ("anomaly".equals(type)) {
            actions.add("Investigate unusual patterns");
            actions.add("Review security logs");
            actions.add("Update access controls if needed");
        }
        suggestion.setActions(actions);
        
        return suggestion;
    }

    private String generateAIPrompt(String datasetId, String analysisType) {
        return String.format(
            "Analyze dataset %s with focus on %s. Provide insights, recommendations, and identify any anomalies or trends. Consider market performance, user behavior, and data quality.",
            datasetId, analysisType
        );
    }

    // Batch processing for multiple datasets
    public Map<String, AISuggestionsDTO> getBatchSuggestions(List<String> datasetIds, String analysisType) {
        Map<String, AISuggestionsDTO> results = new HashMap<>();
        
        for (String datasetId : datasetIds) {
            results.put(datasetId, getAISuggestions(datasetId, analysisType));
        }
        
        return results;
    }

    // Real-time analysis with streaming (optional)
    public Mono<AISuggestionsDTO> getStreamingSuggestions(String datasetId, String analysisType) {
        return webClient.post()
                .uri("/analyze/stream")
                .header("Authorization", "Bearer " + apiKey)
                .bodyValue(Map.of(
                    "dataset_id", datasetId,
                    "analysis_type", analysisType
                ))
                .retrieve()
                .bodyToMono(AISuggestionsDTO.class)
                .onErrorResume(e -> {
                    logger.warn("Streaming AI error: {}", e.getMessage());
                    return Mono.just(generateDemoSuggestions(datasetId, analysisType));
                });
    }
}