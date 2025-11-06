package com.evmarketplace.dto;

import java.util.List;
import java.util.Map;

public class DashboardDataDTO {
    private Long datasetId;
    private String datasetTitle;
    private Map<String, Object> summaryMetrics;
    private List<TimeSeriesData> timeSeries;
    private List<CategoryData> categories;
    private Map<String, Object> insights;

    // Constructors
    public DashboardDataDTO() {}

    public DashboardDataDTO(Long datasetId, String datasetTitle, Map<String, Object> summaryMetrics) {
        this.datasetId = datasetId;
        this.datasetTitle = datasetTitle;
        this.summaryMetrics = summaryMetrics;
    }

    // Getters and Setters
    public Long getDatasetId() { return datasetId; }
    public void setDatasetId(Long datasetId) { this.datasetId = datasetId; }
    
    public String getDatasetTitle() { return datasetTitle; }
    public void setDatasetTitle(String datasetTitle) { this.datasetTitle = datasetTitle; }
    
    public Map<String, Object> getSummaryMetrics() { return summaryMetrics; }
    public void setSummaryMetrics(Map<String, Object> summaryMetrics) { this.summaryMetrics = summaryMetrics; }
    
    public List<TimeSeriesData> getTimeSeries() { return timeSeries; }
    public void setTimeSeries(List<TimeSeriesData> timeSeries) { this.timeSeries = timeSeries; }
    
    public List<CategoryData> getCategories() { return categories; }
    public void setCategories(List<CategoryData> categories) { this.categories = categories; }
    
    public Map<String, Object> getInsights() { return insights; }
    public void setInsights(Map<String, Object> insights) { this.insights = insights; }

    // Inner classes for nested data
    public static class TimeSeriesData {
        private String timestamp;
        private Double value;
        private String metric;

        public TimeSeriesData() {}
        public TimeSeriesData(String timestamp, Double value, String metric) {
            this.timestamp = timestamp;
            this.value = value;
            this.metric = metric;
        }

        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
        public Double getValue() { return value; }
        public void setValue(Double value) { this.value = value; }
        public String getMetric() { return metric; }
        public void setMetric(String metric) { this.metric = metric; }
    }

    public static class CategoryData {
        private String category;
        private Double value;
        private Long count;

        public CategoryData() {}
        public CategoryData(String category, Double value, Long count) {
            this.category = category;
            this.value = value;
            this.count = count;
        }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public Double getValue() { return value; }
        public void setValue(Double value) { this.value = value; }
        public Long getCount() { return count; }
        public void setCount(Long count) { this.count = count; }
    }
}