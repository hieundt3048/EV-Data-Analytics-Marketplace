package com.evmarketplace.Repository;

import com.evmarketplace.Pojo.ProviderDataset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProviderDatasetRepository extends JpaRepository<ProviderDataset, Long> {
    
    // Find all datasets by provider ID
    List<ProviderDataset> findByProviderId(Long providerId);
    
    // Find datasets by status
    List<ProviderDataset> findByStatus(String status);
    
    // Find datasets by provider ID and status
    List<ProviderDataset> findByProviderIdAndStatus(Long providerId, String status);
}
