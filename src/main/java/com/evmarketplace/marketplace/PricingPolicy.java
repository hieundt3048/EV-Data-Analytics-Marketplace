package com.evmarketplace.marketplace;

import java.util.UUID;

public class PricingPolicy {
    public UUID id;
    public UUID productId;
    public PricingModel model;
    public java.math.BigDecimal price;
    public String currency;
    public String billingUnit;

    public PricingPolicy() {}

    // TODO: calculatePrice(usage)
}
