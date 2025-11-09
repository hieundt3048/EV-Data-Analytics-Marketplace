package com.evmarketplace.Controller;

import com.evmarketplace.Service.RecommendationService;
import com.evmarketplace.dto.RecommendationDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for AI-powered Dataset Recommendations
 * Provides personalized recommendations using collaborative filtering,
 * content-based filtering, and trending analysis
 */
@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {
    
    private final RecommendationService recommendationService;
    
    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }
    
    /**
     * GET /api/recommendations/personalized
     * Get personalized recommendations for logged-in consumer
     * Uses hybrid approach: collaborative + content-based + trending
     * 
     * @param limit Number of recommendations (default: 10)
     * @return List of recommended datasets with scores
     */
    @GetMapping("/personalized")
    @PreAuthorize("hasRole('CONSUMER')")
    public ResponseEntity<List<RecommendationDTO>> getPersonalizedRecommendations(
            Authentication authentication,
            @RequestParam(defaultValue = "10") int limit) {
        
        Long consumerId = extractConsumerId(authentication);
        List<RecommendationDTO> recommendations = 
            recommendationService.getPersonalizedRecommendations(consumerId, limit);
        
        return ResponseEntity.ok(recommendations);
    }
    
    /**
     * GET /api/recommendations/trending
     * Get trending datasets (public, no auth required)
     * Based on purchases in last 30 days
     * 
     * @param limit Number of trending datasets (default: 10)
     * @return List of trending datasets
     */
    @GetMapping("/trending")
    public ResponseEntity<List<RecommendationDTO>> getTrendingDatasets(
            @RequestParam(defaultValue = "10") int limit) {
        
        List<RecommendationDTO> trending = recommendationService.getTrendingDatasets(limit);
        return ResponseEntity.ok(trending);
    }
    
    /**
     * GET /api/recommendations/similar/{datasetId}
     * Get datasets similar to a specific dataset
     * Based on category and attributes
     * 
     * @param datasetId Target dataset ID
     * @param limit Number of similar datasets (default: 5)
     * @return List of similar datasets
     */
    @GetMapping("/similar/{datasetId}")
    public ResponseEntity<List<RecommendationDTO>> getSimilarDatasets(
            @PathVariable Long datasetId,
            @RequestParam(defaultValue = "5") int limit) {
        
        List<RecommendationDTO> similar = 
            recommendationService.getSimilarDatasets(datasetId, limit);
        
        return ResponseEntity.ok(similar);
    }
    
    /**
     * GET /api/recommendations/for-you
     * Alias for personalized recommendations (user-friendly endpoint)
     */
    @GetMapping("/for-you")
    @PreAuthorize("hasRole('CONSUMER')")
    public ResponseEntity<List<RecommendationDTO>> getRecommendationsForYou(
            Authentication authentication,
            @RequestParam(defaultValue = "10") int limit) {
        
        return getPersonalizedRecommendations(authentication, limit);
    }
    
    /**
     * Helper method to extract consumer ID from authentication
     * TODO: Implement proper extraction based on JWT/SecurityContext
     */
    private Long extractConsumerId(Authentication authentication) {
        // Placeholder - extract from JWT token or SecurityContext
        Object principal = authentication.getPrincipal();
        
        if (principal instanceof Long) {
            return (Long) principal;
        }
        
        // TODO: Implement proper consumer ID extraction
        return 1L; // Placeholder
    }
}
