package com.evmarketplace.admin;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.UUID;

public class RevenueReport {
    public UUID id;
    public UUID providerId;
    public Date periodStart;
    public Date periodEnd;
    public BigDecimal totalRevenue;
    public List<?> items; // list of Transaction or similar

    public RevenueReport() {}

    // TODO: generate()
}
