package com.evmarketplace.Repository;

import com.evmarketplace.Pojo.ProviderDataset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProviderDatasetRepository extends JpaRepository<ProviderDataset, Long> {
}
