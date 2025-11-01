package com.evmarketplace.Controller;

import com.evmarketplace.Service.RevenueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/provider/revenue")
public class DatasetRevenueController {

    @Autowired
    private RevenueService revenueService;

    // API: GET /api/provider/revenue/report
    @GetMapping("/report")
    public Map<String, Object> getRevenueReport() {
        return revenueService.getRevenueSummary();
    }
}
