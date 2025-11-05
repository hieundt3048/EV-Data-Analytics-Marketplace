package com.evmarketplace.aspect;

import com.evmarketplace.Service.AccessControlService;
import com.evmarketplace.marketplace.AccessType;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Aspect
@Component
public class AccessControlAspect {

    private final AccessControlService accessControlService;

    public AccessControlAspect(AccessControlService accessControlService) {
        this.accessControlService = accessControlService;
    }

    @Before("@annotation(RequiresDatasetAccess) && args(datasetId, ..)")
    public void checkDatasetAccess(UUID datasetId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("Authentication required");
        }

        String username = authentication.getName();
        UUID userId = getUserIdFromUsername(username);
        
        if (!accessControlService.hasAccess(userId, datasetId, AccessType.DOWNLOAD)) {
            throw new SecurityException("Access denied to dataset: " + datasetId);
        }
    }

    @Before("@annotation(RequiresDashboardAccess) && args(datasetId, ..)")
    public void checkDashboardAccess(UUID datasetId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("Authentication required");
        }

        String username = authentication.getName();
        UUID userId = getUserIdFromUsername(username);
        
        if (!accessControlService.hasAccess(userId, datasetId, AccessType.API)) {
            throw new SecurityException("Dashboard access denied to dataset: " + datasetId);
        }
    }

    private UUID getUserIdFromUsername(String username) {
        // TODO: Implement logic to get UUID from username/email
        // Tạm thời sử dụng fixed UUID cho demo
        return UUID.nameUUIDFromBytes(username.getBytes());
    }
}