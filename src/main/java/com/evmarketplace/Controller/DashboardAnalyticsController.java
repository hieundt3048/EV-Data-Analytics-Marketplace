package com.evmarketplace.Controller;

import com.evmarketplace.Service.DashboardAnalyticsService;
import com.evmarketplace.dto.DashboardDataDTO;
// import com.evmarketplace.aspect.RequiresDashboardAccess; // Temporarily disabled
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/dashboards")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
public class DashboardAnalyticsController {

    private final DashboardAnalyticsService dashboardAnalyticsService;

    public DashboardAnalyticsController(DashboardAnalyticsService dashboardAnalyticsService) {
        this.dashboardAnalyticsService = dashboardAnalyticsService;
    }

    @GetMapping("/{datasetId}")
    // @RequiresDashboardAccess // Temporarily disabled for testing
    public ResponseEntity<DashboardDataDTO> getDashboardData(
            @PathVariable Long datasetId,
            @RequestParam(required = false) UUID consumerId) {
        
        try {
            DashboardDataDTO dashboardData = dashboardAnalyticsService.getDashboardData(datasetId);
            return ResponseEntity.ok(dashboardData);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{datasetId}/advanced")
    // @RequiresDashboardAccess // Temporarily disabled for testing
    public ResponseEntity<Map<String, Object>> getAdvancedMetrics(
            @PathVariable Long datasetId,
            @RequestParam(required = false) UUID consumerId) {
        
        try {
            Map<String, Object> advancedMetrics = dashboardAnalyticsService.getAdvancedMetrics(datasetId);
            return ResponseEntity.ok(advancedMetrics);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{datasetId}/export")
    // @RequiresDashboardAccess // Temporarily disabled for testing
    public ResponseEntity<String> exportDashboardData(
            @PathVariable Long datasetId,
            @RequestParam(required = false) String format) {
        
        try {
            // Giả lập export functionality
            String exportData = "Dashboard data export for dataset " + datasetId + " in " + format + " format";
            return ResponseEntity.ok(exportData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Export failed: " + e.getMessage());
        }
    }
}