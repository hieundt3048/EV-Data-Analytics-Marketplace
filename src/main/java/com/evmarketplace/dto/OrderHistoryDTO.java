package com.evmarketplace.dto;

import java.time.LocalDateTime;

public class OrderHistoryDTO {
    private Long id;
    private Long datasetId;
    private String datasetTitle;
    private String itemTitle;
    private Double amount;
    private LocalDateTime purchaseDate;
    private LocalDateTime timestamp;
    private String status;
    private String category;  // Thêm category từ ProviderDataset
    private String pricingType;  // Thêm pricingType từ ProviderDataset (per_request, subscription)

    public OrderHistoryDTO() {}

    public OrderHistoryDTO(Long id, Long datasetId, String datasetTitle, Double amount, LocalDateTime purchaseDate, String status) {
        this.id = id;
        this.datasetId = datasetId;
        this.datasetTitle = datasetTitle;
        this.itemTitle = datasetTitle;
        this.amount = amount;
        this.purchaseDate = purchaseDate;
        this.timestamp = purchaseDate;
        this.status = status;
    }

    public OrderHistoryDTO(Long id, Long datasetId, String datasetTitle, Double amount, LocalDateTime purchaseDate, String status, String category, String pricingType) {
        this.id = id;
        this.datasetId = datasetId;
        this.datasetTitle = datasetTitle;
        this.itemTitle = datasetTitle;
        this.amount = amount;
        this.purchaseDate = purchaseDate;
        this.timestamp = purchaseDate;
        this.status = status;
        this.category = category;
        this.pricingType = pricingType;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getDatasetId() {
        return datasetId;
    }

    public void setDatasetId(Long datasetId) {
        this.datasetId = datasetId;
    }

    public String getDatasetTitle() {
        return datasetTitle;
    }

    public void setDatasetTitle(String datasetTitle) {
        this.datasetTitle = datasetTitle;
        this.itemTitle = datasetTitle;
    }

    public String getItemTitle() {
        return itemTitle;
    }

    public void setItemTitle(String itemTitle) {
        this.itemTitle = itemTitle;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public LocalDateTime getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDateTime purchaseDate) {
        this.purchaseDate = purchaseDate;
        this.timestamp = purchaseDate;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getPricingType() {
        return pricingType;
    }

    public void setPricingType(String pricingType) {
        this.pricingType = pricingType;
    }
}

