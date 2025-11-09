package com.evmarketplace.dto;

import java.util.List;

/**
 * DTO for AI-powered dataset recommendations
 */
public class RecommendationDTO {
    
    private Long datasetId;
    private String datasetName;
    private String description;
    private String category;
    private Double price;
    private Double recommendationScore; // 0.0 - 1.0
    private String recommendationType; // "COLLABORATIVE", "CONTENT_BASED", "TRENDING", "POPULAR"
    private String reason; // Why this is recommended
    private Integer purchaseCount;
    private Integer viewCount;
    private Double averageRating;
    private List<String> tags;
    
    // Constructor
    public RecommendationDTO() {}
    
    public RecommendationDTO(Long datasetId, String datasetName, Double recommendationScore, String recommendationType) {
        this.datasetId = datasetId;
        this.datasetName = datasetName;
        this.recommendationScore = recommendationScore;
        this.recommendationType = recommendationType;
    }
    
    // Getters and Setters
    public Long getDatasetId() {
        return datasetId;
    }
    
    public void setDatasetId(Long datasetId) {
        this.datasetId = datasetId;
    }
    
    public String getDatasetName() {
        return datasetName;
    }
    
    public void setDatasetName(String datasetName) {
        this.datasetName = datasetName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public Double getPrice() {
        return price;
    }
    
    public void setPrice(Double price) {
        this.price = price;
    }
    
    public Double getRecommendationScore() {
        return recommendationScore;
    }
    
    public void setRecommendationScore(Double recommendationScore) {
        this.recommendationScore = recommendationScore;
    }
    
    public String getRecommendationType() {
        return recommendationType;
    }
    
    public void setRecommendationType(String recommendationType) {
        this.recommendationType = recommendationType;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
    
    public Integer getPurchaseCount() {
        return purchaseCount;
    }
    
    public void setPurchaseCount(Integer purchaseCount) {
        this.purchaseCount = purchaseCount;
    }
    
    public Integer getViewCount() {
        return viewCount;
    }
    
    public void setViewCount(Integer viewCount) {
        this.viewCount = viewCount;
    }
    
    public Double getAverageRating() {
        return averageRating;
    }
    
    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }
    
    public List<String> getTags() {
        return tags;
    }
    
    public void setTags(List<String> tags) {
        this.tags = tags;
    }
}
