package com.evmarketplace.Repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.evmarketplace.data.DataProduct;
import com.evmarketplace.data.DataType;
import com.evmarketplace.data.ProductStatus;

@Repository
public interface DataProductRepository extends JpaRepository<DataProduct, UUID> {
    List<DataProduct> findByDataTypeAndRegion(DataType dataType, String region);
    List<DataProduct> findByStatus(ProductStatus status);
}
