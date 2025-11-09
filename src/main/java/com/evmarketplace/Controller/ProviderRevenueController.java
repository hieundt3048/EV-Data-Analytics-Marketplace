package com.evmarketplace.Controller;

import com.evmarketplace.Service.RevenueAnalyticsService;
import com.evmarketplace.dto.ProviderRevenueDTO;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * REST Controller for Provider Revenue Analytics
 * Provides comprehensive revenue reporting and analytics for providers
 */
@RestController
@RequestMapping("/api/provider/revenue")
@PreAuthorize("hasRole('PROVIDER')")
public class ProviderRevenueController {
    
    private final RevenueAnalyticsService revenueAnalyticsService;
    
    public ProviderRevenueController(RevenueAnalyticsService revenueAnalyticsService) {
        this.revenueAnalyticsService = revenueAnalyticsService;
    }
    
    /**
     * GET /api/provider/revenue/dashboard
     * Get comprehensive revenue analytics dashboard
     * 
     * Optional query params:
     * - startDate: Filter from date (ISO format: 2025-01-01T00:00:00)
     * - endDate: Filter to date (ISO format: 2025-12-31T23:59:59)
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ProviderRevenueDTO> getRevenueDashboard(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        Long providerId = extractProviderId(authentication);
        ProviderRevenueDTO revenue = revenueAnalyticsService.getProviderRevenue(providerId, startDate, endDate);
        
        return ResponseEntity.ok(revenue);
    }
    
    /**
     * GET /api/provider/revenue/dataset/{datasetId}
     * Get revenue summary for a specific dataset
     */
    @GetMapping("/dataset/{datasetId}")
    public ResponseEntity<Map<String, Object>> getDatasetRevenue(
            Authentication authentication,
            @PathVariable Long datasetId) {
        
        Long providerId = extractProviderId(authentication);
        
        // TODO: Add authorization check to verify provider owns this dataset
        
        Map<String, Object> summary = revenueAnalyticsService.getDatasetRevenueSummary(datasetId);
        return ResponseEntity.ok(summary);
    }
    
    /**
     * GET /api/provider/revenue/summary
     * Get quick revenue summary (lightweight endpoint)
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getRevenueSummary(Authentication authentication) {
        Long providerId = extractProviderId(authentication);
        
        // Get last 30 days by default
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(30);
        
        ProviderRevenueDTO fullData = revenueAnalyticsService.getProviderRevenue(providerId, startDate, endDate);
        
        // Return only summary metrics
        Map<String, Object> summary = Map.of(
            "totalRevenue", fullData.getTotalRevenue(),
            "monthlyRevenue", fullData.getMonthlyRevenue(),
            "totalDownloads", fullData.getTotalDownloads(),
            "monthlyDownloads", fullData.getMonthlyDownloads(),
            "totalBuyers", fullData.getTotalBuyers(),
            "activeBuyers", fullData.getActiveBuyers()
        );
        
        return ResponseEntity.ok(summary);
    }
    
    /**
     * Helper method to extract provider ID from authentication
     */
    private Long extractProviderId(Authentication authentication) {
        // Assuming the provider ID is stored in authentication principal
        // Adjust based on your actual authentication setup
        Object principal = authentication.getPrincipal();
        
        if (principal instanceof Long) {
            return (Long) principal;
        }
        
        // If using UserDetails or custom principal, extract ID accordingly
        // For now, return a placeholder
        // TODO: Implement proper provider ID extraction based on your auth setup
        return 1L; // Placeholder
    }
}
