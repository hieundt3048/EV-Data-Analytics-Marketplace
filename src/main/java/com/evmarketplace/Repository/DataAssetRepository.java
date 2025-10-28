package com.evmarketplace.Repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.evmarketplace.data.DataAsset;

@Repository
public interface DataAssetRepository extends JpaRepository<DataAsset, UUID> {
    List<DataAsset> findByProductId(UUID productId);
}
