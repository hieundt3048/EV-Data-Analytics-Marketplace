package com.evmarketplace.dto;

public class ConsumerDashboardDTO {
    private int totalDatasets;
    private int totalPurchases;
    private int activeApiKeys;
    private String topCategoryName;
    private int topCategoryPercent;

    // Getters and Setters
    public int getTotalDatasets() {
        return totalDatasets;
    }

    public void setTotalDatasets(int totalDatasets) {
        this.totalDatasets = totalDatasets;
    }

    public int getTotalPurchases() {
        return totalPurchases;
    }

    public void setTotalPurchases(int totalPurchases) {
        this.totalPurchases = totalPurchases;
    }

    public int getActiveApiKeys() {
        return activeApiKeys;
    }

    public void setActiveApiKeys(int activeApiKeys) {
        this.activeApiKeys = activeApiKeys;
    }

    public String getTopCategoryName() {
        return topCategoryName;
    }

    public void setTopCategoryName(String topCategoryName) {
        this.topCategoryName = topCategoryName;
    }

    public int getTopCategoryPercent() {
        return topCategoryPercent;
    }

    public void setTopCategoryPercent(int topCategoryPercent) {
        this.topCategoryPercent = topCategoryPercent;
    }
}