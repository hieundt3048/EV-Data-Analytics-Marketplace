package com.evmarketplace.Pojo;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "datasets")
public class Dataset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 4000)
    private String description;

    private Double price;
    private Boolean isSubscription;
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    // === THÊM CÁC FIELDS MỚI Ở ĐÂY ===
    
    @Column(name = "region")
    private String region;  // Thêm field region

    @Column(name = "data_type")
    private String dataType;  // Thêm field dataType

    @Column(name = "size")
    private String size;  // Thêm field size (e.g., "2.4 GB")

    @Column(name = "tags", length = 500)
    private String tags;  // Thêm field tags (comma-separated)

    @Column(name = "vehicle_type")
    private String vehicleType;  // Thêm field vehicle_type

    @Column(name = "purchase_count")
    private Integer purchaseCount;  // Thêm field purchase_count

    @Column(name = "collection_date")
    private String collectionDate;  // Thêm field collection_date

    // === KẾT THÚC THÊM FIELDS ===

    public Dataset() {}

    // Các getters và setters hiện tại...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Boolean getIsSubscription() { return isSubscription; }
    public void setIsSubscription(Boolean isSubscription) { this.isSubscription = isSubscription; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    // === THÊM GETTERS VÀ SETTERS CHO CÁC FIELDS MỚI ===
    
    public String getRegion() { 
        return region; 
    }
    
    public void setRegion(String region) { 
        this.region = region; 
    }
    
    public String getDataType() {
        return dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public Integer getPurchaseCount() {
        return purchaseCount;
    }

    public void setPurchaseCount(Integer purchaseCount) {
        this.purchaseCount = purchaseCount;
    }

    public String getCollectionDate() {
        return collectionDate;
    }

    public void setCollectionDate(String collectionDate) {
        this.collectionDate = collectionDate;
    }
}