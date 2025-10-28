package com.evmarketplace.Repository;

import com.evmarketplace.data.DatasetMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DatasetMetadataRepository extends JpaRepository<DatasetMetadata, java.util.UUID> {
    DatasetMetadata findByProductId(java.util.UUID productId);
}
