package com.evmarketplace.Service;

import com.evmarketplace.Pojo.Dashboard;
import com.evmarketplace.Repository.DashboardRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DashboardService {
    private final DashboardRepository repo;
    public DashboardService(DashboardRepository repo){ this.repo = repo; }
    public List<Dashboard> findByDatasetId(Long datasetId){ return repo.findByDatasetId(datasetId); }
}
