package com.evmarketplace.marketplace;

import java.util.List;
import java.util.UUID;

public class UsagePolicy {
    public UUID id;
    public UUID productId;
    public AllowedUse allowedUse;
    public List<String> restrictions;

    public UsagePolicy() {}
}
