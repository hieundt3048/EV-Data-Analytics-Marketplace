package com.evmarketplace.Repository;

import java.util.UUID;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.evmarketplace.data.DatasetMetadata;

@Repository
public interface DatasetMetadataRepository extends CrudRepository<DatasetMetadata, UUID> {
    DatasetMetadata findByProductId(UUID productId);
}
