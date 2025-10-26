package com.evmarketplace.privacy;

import java.util.Date;
import java.util.UUID;

public class AuditLog {
    public UUID id;
    public String eventType;
    public UUID actorId;
    public String details;
    public Date timestamp;

    public AuditLog() {}
}
