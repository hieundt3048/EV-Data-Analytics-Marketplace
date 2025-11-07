package com.evmarketplace.Controller;

import com.evmarketplace.dto.ConsumerDashboardDTO;
import com.evmarketplace.Service.ConsumerDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/consumer/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class ConsumerDashboardController {

    private final ConsumerDashboardService dashboardService;

    public ConsumerDashboardController(ConsumerDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<ConsumerDashboardDTO> getConsumerDashboard() {
        try {
            ConsumerDashboardDTO dashboard = dashboardService.getConsumerDashboard();
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}