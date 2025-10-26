package com.evmarketplace.marketplace;

import java.util.Date;
import java.util.UUID;

public class AccessGrant {
    public UUID id;
    public UUID consumerId;
    public UUID productId;
    public AccessType accessType;
    public Date grantedAt;
    public Date expiresAt;

    public AccessGrant() {}

    // TODO: revoke()
}
