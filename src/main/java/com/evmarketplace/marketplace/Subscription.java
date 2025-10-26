package com.evmarketplace.marketplace;

import java.math.BigDecimal;
import java.util.Date;
import java.util.UUID;

public class Subscription {
    public UUID id;
    public UUID consumerId;
    public UUID planId;
    public Date startDate;
    public Date endDate;
    public BigDecimal recurringFee;
    public SubscriptionStatus status;

    public Subscription() {}
}
