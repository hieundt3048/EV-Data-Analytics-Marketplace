package com.evmarketplace.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller để handle các request đến /api/report
 * Tạm thời trả về mock data để tránh 403 Forbidden
 */
@RestController
@RequestMapping("/api/report")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class ReportController {

    /**
     * GET /api/report/provider/id={providerId}
     * Temporary endpoint để tránh 403 error
     */
    @GetMapping("/provider/id={providerId}")
    public ResponseEntity<Map<String, Object>> getProviderReport(@PathVariable Long providerId) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Provider report endpoint - under construction");
        response.put("providerId", providerId);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Alternative endpoint: GET /api/report/provider
     */
    @GetMapping("/provider")
    public ResponseEntity<Map<String, Object>> getProviderReportAlt(@RequestParam Long id) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Provider report endpoint - under construction");
        response.put("providerId", id);
        
        return ResponseEntity.ok(response);
    }
}
