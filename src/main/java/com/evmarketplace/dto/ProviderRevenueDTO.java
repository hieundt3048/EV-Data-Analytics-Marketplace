package com.evmarketplace.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * DTO for provider revenue analytics dashboard
 */
public class ProviderRevenueDTO {
    
    // Summary metrics
    private Double totalRevenue;
    private Double monthlyRevenue;
    private Integer totalDownloads;
    private Integer monthlyDownloads;
    private Integer totalBuyers;
    private Integer activeBuyers; // Buyers in last 30 days
    
    // Revenue by dataset
    private List<DatasetRevenue> revenueByDataset;
    
    // Revenue trend (time series)
    private List<RevenueTrend> revenueTrend;
    
    // Buyer demographics
    private BuyerDemographics buyerDemographics;
    
    // Top performing datasets
    private List<TopDataset> topDatasets;
    
    // Recent transactions
    private List<RecentTransaction> recentTransactions;
    
    // Inner classes for nested data
    public static class DatasetRevenue {
        private Long datasetId;
        private String datasetName;
        private Double revenue;
        private Integer downloads;
        private Integer uniqueBuyers;
        
        // Getters and Setters
        public Long getDatasetId() { return datasetId; }
        public void setDatasetId(Long datasetId) { this.datasetId = datasetId; }
        
        public String getDatasetName() { return datasetName; }
        public void setDatasetName(String datasetName) { this.datasetName = datasetName; }
        
        public Double getRevenue() { return revenue; }
        public void setRevenue(Double revenue) { this.revenue = revenue; }
        
        public Integer getDownloads() { return downloads; }
        public void setDownloads(Integer downloads) { this.downloads = downloads; }
        
        public Integer getUniqueBuyers() { return uniqueBuyers; }
        public void setUniqueBuyers(Integer uniqueBuyers) { this.uniqueBuyers = uniqueBuyers; }
    }
    
    public static class RevenueTrend {
        private String period; // "2025-01", "2025-W01", etc.
        private Double revenue;
        private Integer orders;
        private Integer downloads;
        
        public RevenueTrend(String period, Double revenue, Integer orders, Integer downloads) {
            this.period = period;
            this.revenue = revenue;
            this.orders = orders;
            this.downloads = downloads;
        }
        
        // Getters and Setters
        public String getPeriod() { return period; }
        public void setPeriod(String period) { this.period = period; }
        
        public Double getRevenue() { return revenue; }
        public void setRevenue(Double revenue) { this.revenue = revenue; }
        
        public Integer getOrders() { return orders; }
        public void setOrders(Integer orders) { this.orders = orders; }
        
        public Integer getDownloads() { return downloads; }
        public void setDownloads(Integer downloads) { this.downloads = downloads; }
    }
    
    public static class BuyerDemographics {
        private Map<String, Integer> byOrganization; // Organization name -> count
        private Map<String, Integer> byRegion; // Region -> count
        private Map<String, Integer> byIndustry; // Industry -> count
        private List<TopBuyer> topBuyers;
        
        // Getters and Setters
        public Map<String, Integer> getByOrganization() { return byOrganization; }
        public void setByOrganization(Map<String, Integer> byOrganization) { this.byOrganization = byOrganization; }
        
        public Map<String, Integer> getByRegion() { return byRegion; }
        public void setByRegion(Map<String, Integer> byRegion) { this.byRegion = byRegion; }
        
        public Map<String, Integer> getByIndustry() { return byIndustry; }
        public void setByIndustry(Map<String, Integer> byIndustry) { this.byIndustry = byIndustry; }
        
        public List<TopBuyer> getTopBuyers() { return topBuyers; }
        public void setTopBuyers(List<TopBuyer> topBuyers) { this.topBuyers = topBuyers; }
    }
    
    public static class TopBuyer {
        private Long buyerId;
        private String buyerName;
        private String organization;
        private Double totalSpent;
        private Integer purchaseCount;
        
        // Getters and Setters
        public Long getBuyerId() { return buyerId; }
        public void setBuyerId(Long buyerId) { this.buyerId = buyerId; }
        
        public String getBuyerName() { return buyerName; }
        public void setBuyerName(String buyerName) { this.buyerName = buyerName; }
        
        public String getOrganization() { return organization; }
        public void setOrganization(String organization) { this.organization = organization; }
        
        public Double getTotalSpent() { return totalSpent; }
        public void setTotalSpent(Double totalSpent) { this.totalSpent = totalSpent; }
        
        public Integer getPurchaseCount() { return purchaseCount; }
        public void setPurchaseCount(Integer purchaseCount) { this.purchaseCount = purchaseCount; }
    }
    
    public static class TopDataset {
        private Long datasetId;
        private String datasetName;
        private Double revenue;
        private Integer downloads;
        private Double growthRate; // % growth vs previous period
        
        // Getters and Setters
        public Long getDatasetId() { return datasetId; }
        public void setDatasetId(Long datasetId) { this.datasetId = datasetId; }
        
        public String getDatasetName() { return datasetName; }
        public void setDatasetName(String datasetName) { this.datasetName = datasetName; }
        
        public Double getRevenue() { return revenue; }
        public void setRevenue(Double revenue) { this.revenue = revenue; }
        
        public Integer getDownloads() { return downloads; }
        public void setDownloads(Integer downloads) { this.downloads = downloads; }
        
        public Double getGrowthRate() { return growthRate; }
        public void setGrowthRate(Double growthRate) { this.growthRate = growthRate; }
    }
    
    public static class RecentTransaction {
        private Long orderId;
        private Long datasetId;
        private String datasetName;
        private String buyerName;
        private Double amount;
        private LocalDateTime orderDate;
        private String status;
        
        // Getters and Setters
        public Long getOrderId() { return orderId; }
        public void setOrderId(Long orderId) { this.orderId = orderId; }
        
        public Long getDatasetId() { return datasetId; }
        public void setDatasetId(Long datasetId) { this.datasetId = datasetId; }
        
        public String getDatasetName() { return datasetName; }
        public void setDatasetName(String datasetName) { this.datasetName = datasetName; }
        
        public String getBuyerName() { return buyerName; }
        public void setBuyerName(String buyerName) { this.buyerName = buyerName; }
        
        public Double getAmount() { return amount; }
        public void setAmount(Double amount) { this.amount = amount; }
        
        public LocalDateTime getOrderDate() { return orderDate; }
        public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
    
    // Main class Getters and Setters
    public Double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(Double totalRevenue) { this.totalRevenue = totalRevenue; }
    
    public Double getMonthlyRevenue() { return monthlyRevenue; }
    public void setMonthlyRevenue(Double monthlyRevenue) { this.monthlyRevenue = monthlyRevenue; }
    
    public Integer getTotalDownloads() { return totalDownloads; }
    public void setTotalDownloads(Integer totalDownloads) { this.totalDownloads = totalDownloads; }
    
    public Integer getMonthlyDownloads() { return monthlyDownloads; }
    public void setMonthlyDownloads(Integer monthlyDownloads) { this.monthlyDownloads = monthlyDownloads; }
    
    public Integer getTotalBuyers() { return totalBuyers; }
    public void setTotalBuyers(Integer totalBuyers) { this.totalBuyers = totalBuyers; }
    
    public Integer getActiveBuyers() { return activeBuyers; }
    public void setActiveBuyers(Integer activeBuyers) { this.activeBuyers = activeBuyers; }
    
    public List<DatasetRevenue> getRevenueByDataset() { return revenueByDataset; }
    public void setRevenueByDataset(List<DatasetRevenue> revenueByDataset) { this.revenueByDataset = revenueByDataset; }
    
    public List<RevenueTrend> getRevenueTrend() { return revenueTrend; }
    public void setRevenueTrend(List<RevenueTrend> revenueTrend) { this.revenueTrend = revenueTrend; }
    
    public BuyerDemographics getBuyerDemographics() { return buyerDemographics; }
    public void setBuyerDemographics(BuyerDemographics buyerDemographics) { this.buyerDemographics = buyerDemographics; }
    
    public List<TopDataset> getTopDatasets() { return topDatasets; }
    public void setTopDatasets(List<TopDataset> topDatasets) { this.topDatasets = topDatasets; }
    
    public List<RecentTransaction> getRecentTransactions() { return recentTransactions; }
    public void setRecentTransactions(List<RecentTransaction> recentTransactions) { this.recentTransactions = recentTransactions; }
}
