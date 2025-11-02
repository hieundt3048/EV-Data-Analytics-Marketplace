package com.evmarketplace.Repository;

import com.evmarketplace.Pojo.Dashboard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DashboardRepository extends JpaRepository<Dashboard, Long> {
    List<Dashboard> findByDatasetId(Long datasetId);
}

