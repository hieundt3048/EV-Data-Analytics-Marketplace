package com.evmarketplace.dto;

public class CheckoutResponseDTO {
    private String sessionId;
    private String sessionUrl;
    private String status;
    private String message;
    private Long orderId;

    // Constructors
    public CheckoutResponseDTO() {}

    public CheckoutResponseDTO(String sessionId, String sessionUrl, String status, String message, Long orderId) {
        this.sessionId = sessionId;
        this.sessionUrl = sessionUrl;
        this.status = status;
        this.message = message;
        this.orderId = orderId;
    }

    // Getters and Setters
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    
    public String getSessionUrl() { return sessionUrl; }
    public void setSessionUrl(String sessionUrl) { this.sessionUrl = sessionUrl; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
}