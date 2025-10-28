// Mục đích: Mô hình metadata cho bộ dữ liệu (DatasetMetadata).
// Đáp ứng: Lưu các key/value metadata liên quan tới DataProduct theo class diagram.
package com.evmarketplace.data;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.CollectionTable;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.MapKeyColumn;
import javax.persistence.Table;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "dataset_metadata")
public class DatasetMetadata {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "product_id", nullable = false)
    private UUID productId; // Lưu UUID của DataProduct.

    @ElementCollection
    @CollectionTable(name = "dataset_metadata_entries", joinColumns = @JoinColumn(name = "metadata_id"))
    @MapKeyColumn(name = "meta_key")
    @Column(name = "meta_value")
    private Map<String, String> keyValues = new HashMap<>();

    public DatasetMetadata() {}

    public DatasetMetadata(UUID productId) {
        this.productId = productId;
    }

    public UUID getId() {
        return id;
    }

    public UUID getProductId() {
        return productId;
    }

    public void setProductId(UUID productId) {
        this.productId = productId;
    }

    public Map<String, String> getKeyValues() {
        return keyValues;
    }

    public void setKeyValues(Map<String, String> keyValues) {
        this.keyValues = keyValues;
    }
}
