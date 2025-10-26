package com.evmarketplace.marketplace;

import java.math.BigDecimal;
import java.util.Date;
import java.util.UUID;

public class Purchase {
    public UUID id;
    public UUID consumerId;
    public UUID productId;
    public UUID pricingPolicyId;
    public BigDecimal amount;
    public String currency;
    public PurchaseStatus status;
    public Date createdAt;

    public Purchase() {}

    // TODO: completePurchase()
}
