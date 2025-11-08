package com.evmarketplace.dto;

import javax.validation.constraints.NotNull;

/**
 * Request DTO for creating an order/checkout session.
 * Previously used UUID fields but underlying entities use numeric (Long) IDs.
 * Using Long eliminates JSON parse errors when client sends numeric IDs.
 */
public class OrderRequestDTO {

    @NotNull(message = "Dataset ID is required")
    private Long datasetId;

    // Consumer ID may be resolved from authentication; keep optional for now
    private Long consumerId;

    private String paymentMethod = "card"; // default method
    private String billingEmail;

    public OrderRequestDTO() {}

    public OrderRequestDTO(Long datasetId, Long consumerId, String paymentMethod, String billingEmail) {
        this.datasetId = datasetId;
        this.consumerId = consumerId;
        this.paymentMethod = paymentMethod;
        this.billingEmail = billingEmail;
    }

    public Long getDatasetId() { return datasetId; }
    public void setDatasetId(Long datasetId) { this.datasetId = datasetId; }

    public Long getConsumerId() { return consumerId; }
    public void setConsumerId(Long consumerId) { this.consumerId = consumerId; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getBillingEmail() { return billingEmail; }
    public void setBillingEmail(String billingEmail) { this.billingEmail = billingEmail; }
}