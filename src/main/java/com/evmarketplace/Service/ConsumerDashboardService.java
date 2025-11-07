package com.evmarketplace.Service;

import com.evmarketplace.dto.ConsumerDashboardDTO;
import com.evmarketplace.Repository.DatasetRepository;
import com.evmarketplace.Repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConsumerDashboardService {

    private final DatasetRepository datasetRepository;

    public ConsumerDashboardService(DatasetRepository datasetRepository) {
        this.datasetRepository = datasetRepository;
    }

    @Transactional(readOnly = true)
    public ConsumerDashboardDTO getConsumerDashboard() {
        ConsumerDashboardDTO dashboard = new ConsumerDashboardDTO();
        
        // Đặt một số giá trị mẫu cho testing
        dashboard.setTotalDatasets((int) datasetRepository.count());
        dashboard.setTotalPurchases(10); // Giá trị mẫu
        dashboard.setActiveApiKeys(2); // Giá trị mẫu
        dashboard.setTopCategoryName("Battery Data");
        dashboard.setTopCategoryPercent(65);
        
        return dashboard;
    }
}