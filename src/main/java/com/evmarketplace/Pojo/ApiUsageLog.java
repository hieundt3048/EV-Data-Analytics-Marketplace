package com.evmarketplace.Pojo;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "api_usage_logs", indexes = {
    @Index(name = "idx_api_key_timestamp", columnList = "apiKeyId,timestamp")
})
public class ApiUsageLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long apiKeyId;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @Column(nullable = false)
    private String endpoint; // e.g., "/api/datasets/123/download"
    
    @Column(nullable = false)
    private String method; // GET, POST, etc.
    
    @Column(nullable = false)
    private Integer statusCode; // 200, 404, 429, etc.
    
    @Column
    private Long responseTimeMs; // Response time in milliseconds
    
    @Column
    private String ipAddress;
    
    @Column
    private String userAgent;
    
    @Column(length = 1000)
    private String errorMessage; // If request failed
    
    @Column
    private Long datasetId; // If accessing specific dataset
    
    @Column
    private Long bytesTransferred; // For download tracking
    
    // Constructors
    public ApiUsageLog() {
        this.timestamp = LocalDateTime.now();
    }
    
    public ApiUsageLog(Long apiKeyId, String endpoint, String method) {
        this();
        this.apiKeyId = apiKeyId;
        this.endpoint = endpoint;
        this.method = method;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getApiKeyId() {
        return apiKeyId;
    }
    
    public void setApiKeyId(Long apiKeyId) {
        this.apiKeyId = apiKeyId;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public String getEndpoint() {
        return endpoint;
    }
    
    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }
    
    public String getMethod() {
        return method;
    }
    
    public void setMethod(String method) {
        this.method = method;
    }
    
    public Integer getStatusCode() {
        return statusCode;
    }
    
    public void setStatusCode(Integer statusCode) {
        this.statusCode = statusCode;
    }
    
    public Long getResponseTimeMs() {
        return responseTimeMs;
    }
    
    public void setResponseTimeMs(Long responseTimeMs) {
        this.responseTimeMs = responseTimeMs;
    }
    
    public String getIpAddress() {
        return ipAddress;
    }
    
    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
    
    public String getUserAgent() {
        return userAgent;
    }
    
    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    public Long getDatasetId() {
        return datasetId;
    }
    
    public void setDatasetId(Long datasetId) {
        this.datasetId = datasetId;
    }
    
    public Long getBytesTransferred() {
        return bytesTransferred;
    }
    
    public void setBytesTransferred(Long bytesTransferred) {
        this.bytesTransferred = bytesTransferred;
    }
}
