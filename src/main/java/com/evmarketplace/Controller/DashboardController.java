package com.evmarketplace.Controller;

import com.evmarketplace.Pojo.Dashboard;
import com.evmarketplace.Service.DashboardService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboards")
public class DashboardController {
    private final DashboardService service;
    public DashboardController(DashboardService service){ this.service = service; }

    @GetMapping("/{datasetId}")
    public List<Dashboard> getByDataset(@PathVariable Long datasetId){ return service.findByDatasetId(datasetId); }
}
