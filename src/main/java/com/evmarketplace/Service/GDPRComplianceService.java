package com.evmarketplace.Service;

import java.util.UUID;

public interface GDPRComplianceService {
    void anonymizeUserData(UUID userId);
}
