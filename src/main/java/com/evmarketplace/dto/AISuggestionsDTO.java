package com.evmarketplace.dto;

import java.util.List;

public class AISuggestionsDTO {
    private String datasetId;
    private List<Suggestion> suggestions;
    private String analysisSummary;
    private Double confidenceScore;
    private String generatedAt;

    // Constructors
    public AISuggestionsDTO() {}

    public AISuggestionsDTO(String datasetId, List<Suggestion> suggestions, String analysisSummary) {
        this.datasetId = datasetId;
        this.suggestions = suggestions;
        this.analysisSummary = analysisSummary;
    }

    // Getters and Setters
    public String getDatasetId() { return datasetId; }
    public void setDatasetId(String datasetId) { this.datasetId = datasetId; }
    
    public List<Suggestion> getSuggestions() { return suggestions; }
    public void setSuggestions(List<Suggestion> suggestions) { this.suggestions = suggestions; }
    
    public String getAnalysisSummary() { return analysisSummary; }
    public void setAnalysisSummary(String analysisSummary) { this.analysisSummary = analysisSummary; }
    
    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }
    
    public String getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(String generatedAt) { this.generatedAt = generatedAt; }

    // Inner class for suggestions
    public static class Suggestion {
        private String type; // "insight", "recommendation", "anomaly", "trend"
        private String title;
        private String description;
        private String impact; // "high", "medium", "low"
        private List<String> actions;
        private Double confidence;

        public Suggestion() {}
        public Suggestion(String type, String title, String description, String impact) {
            this.type = type;
            this.title = title;
            this.description = description;
            this.impact = impact;
        }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getImpact() { return impact; }
        public void setImpact(String impact) { this.impact = impact; }
        public List<String> getActions() { return actions; }
        public void setActions(List<String> actions) { this.actions = actions; }
        public Double getConfidence() { return confidence; }
        public void setConfidence(Double confidence) { this.confidence = confidence; }
    }
}