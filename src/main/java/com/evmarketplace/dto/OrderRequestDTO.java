package com.evmarketplace.dto;

import javax.validation.constraints.NotNull;
import java.util.UUID;

public class OrderRequestDTO {
    
    @NotNull(message = "Dataset ID is required")
    private UUID datasetId;
    
    @NotNull(message = "Consumer ID is required") 
    private UUID consumerId;
    
    private String paymentMethod = "card"; // Mặc định là card
    
    private String billingEmail;

    // Constructors
    public OrderRequestDTO() {}

    public OrderRequestDTO(UUID datasetId, UUID consumerId, String paymentMethod, String billingEmail) {
        this.datasetId = datasetId;
        this.consumerId = consumerId;
        this.paymentMethod = paymentMethod;
        this.billingEmail = billingEmail;
    }

    // Getters and Setters
    public UUID getDatasetId() { return datasetId; }
    public void setDatasetId(UUID datasetId) { this.datasetId = datasetId; }
    
    public UUID getConsumerId() { return consumerId; }
    public void setConsumerId(UUID consumerId) { this.consumerId = consumerId; }
    
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    
    public String getBillingEmail() { return billingEmail; }
    public void setBillingEmail(String billingEmail) { this.billingEmail = billingEmail; }
}