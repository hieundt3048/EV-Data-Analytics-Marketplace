package com.evmarketplace.privacy;

import java.util.Date;
import java.util.UUID;

public class Consent {
    public UUID id;
    public UUID subjectId;
    public String consentText;
    public Date grantedAt;
    public Date revokedAt;

    public Consent() {}
}
