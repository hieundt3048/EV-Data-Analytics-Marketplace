package com.evmarketplace.Controller;
  
import com.evmarketplace.Pojo.RevenueReportDTO;
import com.evmarketplace.Service.RevenueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/provider/revenue")
public class DatasetRevenueController {

    private final RevenueService revenueService;

    public DatasetRevenueController(RevenueService revenueService) {
        this.revenueService = revenueService;
    }

    // GET /api/provider/revenue/report?providerId=1
    @GetMapping("/report")
    public ResponseEntity<?> getRevenueReport(@RequestParam(value = "providerId", required = true) Long providerId) {
        if (providerId == null) {
            return ResponseEntity.badRequest().body("Provider ID is required");
        }
        return ResponseEntity.ok(revenueService.getRevenueSummaryForProvider(providerId));
    }
}
