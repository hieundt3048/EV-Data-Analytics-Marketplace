package com.evmarketplace.Controller;

import com.evmarketplace.Service.PayoutService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Admin Controller for Payment Processing and Revenue Sharing
 * Handles platform revenue, provider payouts, and commission management
 */
@RestController
@RequestMapping("/api/admin/payments")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AdminPaymentController {
    
    private final PayoutService payoutService;
    
    public AdminPaymentController(PayoutService payoutService) {
        this.payoutService = payoutService;
    }
    
    /**
     * GET /api/admin/payments/revenue-stats
     * Get platform-wide revenue statistics
     * 
     * Query params:
     * - startDate: Optional filter start date
     * - endDate: Optional filter end date
     */
    @GetMapping("/revenue-stats")
    public ResponseEntity<Map<String, Object>> getPlatformRevenueStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        Map<String, Object> stats = payoutService.getPlatformRevenueStats(startDate, endDate);
        return ResponseEntity.ok(stats);
    }
    
    /**
     * GET /api/admin/payments/provider-payouts
     * Get all provider payouts summary
     */
    @GetMapping("/provider-payouts")
    public ResponseEntity<List<Map<String, Object>>> getAllProviderPayouts() {
        List<Map<String, Object>> payouts = payoutService.getAllProviderPayouts();
        return ResponseEntity.ok(payouts);
    }
    
    /**
     * GET /api/admin/payments/provider/{providerId}/payouts
     * Get pending payouts for a specific provider
     */
    @GetMapping("/provider/{providerId}/payouts")
    public ResponseEntity<List<Map<String, Object>>> getProviderPayouts(@PathVariable Long providerId) {
        List<Map<String, Object>> payouts = payoutService.getPendingPayouts(providerId);
        return ResponseEntity.ok(payouts);
    }
    
    /**
     * GET /api/admin/payments/provider/{providerId}/summary
     * Get revenue summary for a specific provider
     */
    @GetMapping("/provider/{providerId}/summary")
    public ResponseEntity<Map<String, Object>> getProviderRevenueSummary(@PathVariable Long providerId) {
        Map<String, Object> summary = payoutService.getProviderRevenueSummary(providerId);
        return ResponseEntity.ok(summary);
    }
    
    /**
     * POST /api/admin/payments/provider/{providerId}/process
     * Process pending payouts for a provider
     */
    @PostMapping("/provider/{providerId}/process")
    public ResponseEntity<Map<String, Object>> processProviderPayouts(@PathVariable Long providerId) {
        Map<String, Object> result = payoutService.processPayouts(providerId);
        return ResponseEntity.ok(result);
    }
}
