
package com.evmarketplace.Service;

import com.evmarketplace.marketplace.AccessGrant;
import com.evmarketplace.marketplace.AccessType;
import com.evmarketplace.Repository.AccessGrantRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.UUID;
// quản lý quyền truy cập dataset cho consumer (người mua):
@Service
public class AccessControlService {

    // Repository thao tác với bảng access_grant (lưu quyền truy cập dataset)

    private final AccessGrantRepository accessGrantRepository;

    public AccessControlService(AccessGrantRepository accessGrantRepository) {
        this.accessGrantRepository = accessGrantRepository;
    }

    // Cấp quyền truy cập dataset cho consumer khi mua 1 lần (one-time purchase)
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

    // Cấp quyền truy cập dataset cho consumer khi mua subscription
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

    // Thu hồi quyền truy cập dataset (xóa access grant)
    public void revokeAccess(UUID consumerId, UUID datasetId) {
        java.util.List<AccessGrant> existingGrants = accessGrantRepository.findByConsumerId(consumerId)
                .stream()
                .filter(grant -> grant.getProductId().equals(datasetId))
                .collect(java.util.stream.Collectors.toList());
        
        accessGrantRepository.deleteAll(existingGrants);
    }

    // Tính toán ngày hết hạn quyền truy cập:
    // - Subscription: 1 năm
    // - One-time: 30 ngày
    private Date calculateExpiryDate(boolean isSubscription) {
        long expiryMillis = System.currentTimeMillis() + 
            (isSubscription ? 365L * 24 * 60 * 60 * 1000 : 30L * 24 * 60 * 60 * 1000);
        return new Date(expiryMillis);
    }

    // Kiểm tra consumer có quyền truy cập dataset với loại quyền cụ thể không
    // - accessType: API (dashboard) hoặc DOWNLOAD (raw data)
    // - Chỉ trả true nếu chưa hết hạn
    public boolean hasAccess(UUID consumerId, UUID datasetId, AccessType accessType) {
        return accessGrantRepository.findByConsumerId(consumerId)
                .stream()
                .anyMatch(grant -> 
                    grant.getProductId().equals(datasetId) &&
                    grant.getAccessType().equals(accessType) &&
                    (grant.getExpiresAt() == null || grant.getExpiresAt().after(new Date()))
                );
    }

    // Kiểm tra quyền truy cập dashboard (API)
    public boolean hasDashboardAccess(UUID consumerId, UUID datasetId) {
        return hasAccess(consumerId, datasetId, AccessType.API);
    }

    // Kiểm tra quyền truy cập raw data (DOWNLOAD)
    public boolean hasRawDataAccess(UUID consumerId, UUID datasetId) {
        return hasAccess(consumerId, datasetId, AccessType.DOWNLOAD);
    }
}