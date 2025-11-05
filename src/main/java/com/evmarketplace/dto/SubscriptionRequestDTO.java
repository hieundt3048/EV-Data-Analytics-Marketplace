package com.evmarketplace.dto;

import javax.validation.constraints.NotNull;
import java.util.UUID;

public class SubscriptionRequestDTO {
    
    @NotNull(message = "Consumer ID is required")
    private UUID consumerId;
    
    @NotNull(message = "Stripe Plan ID is required")
    private String stripePlanId;
    
    @NotNull(message = "Product name is required")
    private String productName;
    
    @NotNull(message = "Price is required")
    private Double price;

    // Constructors, Getters and Setters
    public SubscriptionRequestDTO() {}

    public SubscriptionRequestDTO(UUID consumerId, String stripePlanId, String productName, Double price) {
        this.consumerId = consumerId;
        this.stripePlanId = stripePlanId;
        this.productName = productName;
        this.price = price;
    }

    public UUID getConsumerId() { return consumerId; }
    public void setConsumerId(UUID consumerId) { this.consumerId = consumerId; }
    
    public String getStripePlanId() { return stripePlanId; }
    public void setStripePlanId(String stripePlanId) { this.stripePlanId = stripePlanId; }
    
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
}