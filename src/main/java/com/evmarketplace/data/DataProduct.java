// Mục đích: Mô hình sản phẩm dữ liệu (DataProduct).
// Đáp ứng: Đại diện DataProduct theo class diagram, chứa metadata, loại dữ liệu, định dạng, kích thước và trạng thái.
package com.evmarketplace.data;

// Mục đích: Thực thể DataProduct lưu thông tin sản phẩm dữ liệu được niêm yết.
// Đáp ứng: Chuyển đổi từ POJO sang entity JPA để Spring Data quản lý/persist theo sơ đồ lớp.

import com.evmarketplace.providers.DataProvider;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.CollectionTable;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.MapKeyColumn;
import javax.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "data_products")
public class DataProduct {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id")
    private DataProvider provider;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ElementCollection
    @CollectionTable(name = "data_product_categories", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "category")
    private List<String> categories = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "data_product_tags", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "data_type")
    private DataType dataType;

    @Enumerated(EnumType.STRING)
    @Column(name = "format")
    private Format format;

    @Column(name = "size_bytes")
    private long sizeBytes;

    @Column(name = "region")
    private String region;

    @Column(name = "available_from")
    private Instant startTime;

    @Column(name = "available_to")
    private Instant endTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ProductStatus status = ProductStatus.DRAFT;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "data_product_attributes", joinColumns = @JoinColumn(name = "product_id"))
    @MapKeyColumn(name = "attr_key")
    @Column(name = "attr_value")
    private Map<String, String> attributes = new HashMap<>();

    protected DataProduct() {
        // Bắt buộc cho JPA
    }

    public DataProduct(DataProvider provider, String title) {
        this.provider = provider;
        this.title = title;
        this.description = "";
        if (provider != null) {
            this.status = provider.isApproved() ? ProductStatus.PENDING_REVIEW : ProductStatus.DRAFT;
        }
    }

    public UUID getId() {
        return id;
    }

    public DataProvider getProvider() {
        return provider;
    }

    public void setProvider(DataProvider provider) {
        this.provider = provider;
    }

    public UUID getProviderId() {
        return provider != null ? provider.getId() : null;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getCategories() {
        return categories;
    }

    public void setCategories(List<String> categories) {
        this.categories = categories;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public DataType getDataType() {
        return dataType;
    }

    public void setDataType(DataType dataType) {
        this.dataType = dataType;
    }

    public Format getFormat() {
        return format;
    }

    public void setFormat(Format format) {
        this.format = format;
    }

    public long getSizeBytes() {
        return sizeBytes;
    }

    public void setSizeBytes(long sizeBytes) {
        this.sizeBytes = sizeBytes;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getEndTime() {
        return endTime;
    }

    public void setEndTime(Instant endTime) {
        this.endTime = endTime;
    }

    public ProductStatus getStatus() {
        return status;
    }

    public void setStatus(ProductStatus status) {
        this.status = status;
    }

    public Map<String, String> getAttributes() {
        return attributes;
    }

    public void setAttributes(Map<String, String> attributes) {
        this.attributes = attributes;
    }
}

