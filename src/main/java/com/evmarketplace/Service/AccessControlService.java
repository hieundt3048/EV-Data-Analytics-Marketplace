package com.evmarketplace.Service;

import com.evmarketplace.marketplace.AccessGrant;
import com.evmarketplace.marketplace.AccessType;
import com.evmarketplace.Repository.AccessGrantRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.UUID;

@Service
public class AccessControlService {

    private final AccessGrantRepository accessGrantRepository;

    public AccessControlService(AccessGrantRepository accessGrantRepository) {
        this.accessGrantRepository = accessGrantRepository;
    }

    // Method cho one-time purchase (đã có)
    public void grantDatasetAccess(UUID consumerId, UUID datasetId) {
        boolean alreadyHasAccess = accessGrantRepository.findByConsumerId(consumerId)
                .stream()
                .anyMatch(grant -> grant.getProductId().equals(datasetId));
        
        if (!alreadyHasAccess) {
            // Cấp quyền truy cập raw data (DOWNLOAD)
            AccessGrant rawDataAccess = new AccessGrant(consumerId, datasetId, AccessType.DOWNLOAD);
            rawDataAccess.setExpiresAt(calculateExpiryDate(false)); // 30 days
            accessGrantRepository.save(rawDataAccess);

            // Cấp quyền truy cập dashboard (API)
            AccessGrant dashboardAccess = new AccessGrant(consumerId, datasetId, AccessType.API);
            dashboardAccess.setExpiresAt(calculateExpiryDate(false)); // 30 days
            accessGrantRepository.save(dashboardAccess);
        }
    }

    // Method cho subscription - FIXED
    public void grantSubscriptionAccess(UUID consumerId, UUID datasetId) {
        // Xóa các access grant cũ (nếu có)
        revokeAccess(consumerId, datasetId);
        
        // Tạo access grant mới với thời hạn 1 năm
        AccessGrant rawDataAccess = new AccessGrant(consumerId, datasetId, AccessType.DOWNLOAD);
        AccessGrant dashboardAccess = new AccessGrant(consumerId, datasetId, AccessType.API);
        
        Date expiryDate = calculateExpiryDate(true); // 1 year for subscription
        
        rawDataAccess.setExpiresAt(expiryDate);
        dashboardAccess.setExpiresAt(expiryDate);
        
        accessGrantRepository.save(rawDataAccess);
        accessGrantRepository.save(dashboardAccess);
    }

    // Method để thu hồi quyền truy cập
    public void revokeAccess(UUID consumerId, UUID datasetId) {
        java.util.List<AccessGrant> existingGrants = accessGrantRepository.findByConsumerId(consumerId)
                .stream()
                .filter(grant -> grant.getProductId().equals(datasetId))
                .collect(java.util.stream.Collectors.toList());
        
        accessGrantRepository.deleteAll(existingGrants);
    }

    private Date calculateExpiryDate(boolean isSubscription) {
        long expiryMillis = System.currentTimeMillis() + 
            (isSubscription ? 365L * 24 * 60 * 60 * 1000 : 30L * 24 * 60 * 60 * 1000);
        return new Date(expiryMillis);
    }

    public boolean hasAccess(UUID consumerId, UUID datasetId, AccessType accessType) {
        return accessGrantRepository.findByConsumerId(consumerId)
                .stream()
                .anyMatch(grant -> 
                    grant.getProductId().equals(datasetId) &&
                    grant.getAccessType().equals(accessType) &&
                    (grant.getExpiresAt() == null || grant.getExpiresAt().after(new Date()))
                );
    }

    // Thêm method để kiểm tra quyền truy cập dashboard
    public boolean hasDashboardAccess(UUID consumerId, UUID datasetId) {
        return hasAccess(consumerId, datasetId, AccessType.API);
    }

    // Thêm method để kiểm tra quyền truy cập raw data
    public boolean hasRawDataAccess(UUID consumerId, UUID datasetId) {
        return hasAccess(consumerId, datasetId, AccessType.DOWNLOAD);
    }
}