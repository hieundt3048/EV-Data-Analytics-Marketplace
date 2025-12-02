
package com.evmarketplace.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;


// Service này dùng để ghi log audit các hành động liên quan đến bảo mật, truy cập dữ liệu

@Service
public class AuditLogService {

    private static final Logger logger = LoggerFactory.getLogger(AuditLogService.class);
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * Ghi log khi user truy cập dataset (dashboard, download...)
     * - Lưu lại ai truy cập, dataset nào, thời điểm, hành động gì
     */
    public void logDatasetAccess(Long datasetId, String datasetName, Long userId, String action) {
        String timestamp = LocalDateTime.now().format(formatter);
        String logMessage = String.format(
            "[AUDIT] %s | DatasetId: %d | DatasetName: %s | UserId: %d | Action: %s",
            timestamp, datasetId, datasetName, userId, action
        );
        logger.info(logMessage);
    }

    /**
     * Ghi log khi provider thay đổi cấu hình bảo mật dataset
     * - Lưu lại phương pháp ẩn danh hóa, access control, audit enable...
     */
    public void logSecurityChange(Long datasetId, String datasetName, Long providerId, 
                                  String anonymizationMethod, String accessControl, 
                                  Boolean auditEnabled) {
        String timestamp = LocalDateTime.now().format(formatter);
        String logMessage = String.format(
            "[AUDIT] %s | DatasetId: %d | DatasetName: %s | ProviderId: %d | " +
            "AnonymizationMethod: %s | AccessControl: %s | AuditEnabled: %s",
            timestamp, datasetId, datasetName, providerId, 
            anonymizationMethod, accessControl, auditEnabled
        );
        logger.info(logMessage);
    }

    /**
     * Ghi log khi xóa dataset vĩnh viễn (theo yêu cầu GDPR hoặc provider xóa)
     * - Lưu lại lý do xóa, cảnh báo ở mức WARN
     */
    public void logDatasetErasure(Long datasetId, String datasetName, Long providerId, String reason) {
        String timestamp = LocalDateTime.now().format(formatter);
        String logMessage = String.format(
            "[AUDIT] %s | DatasetId: %d | DatasetName: %s | ProviderId: %d | Action: ERASED | Reason: %s",
            timestamp, datasetId, datasetName, providerId, reason
        );
        logger.warn(logMessage); // Use WARN level for critical actions
    }

    /**
     * Ghi log khi thực hiện ẩn danh hóa dữ liệu (PII anonymization)
     * - Lưu lại trạng thái (bắt đầu, thành công, thất bại)
     */
    public void logAnonymization(Long datasetId, String datasetName, String status) {
        String timestamp = LocalDateTime.now().format(formatter);
        String logMessage = String.format(
            "[AUDIT] %s | DatasetId: %d | DatasetName: %s | AnonymizationStatus: %s",
            timestamp, datasetId, datasetName, status
        );
        logger.info(logMessage);
    }

    /**
     * Ghi log khi user bị từ chối truy cập dataset (không đủ quyền, hết hạn...)
     * - Lưu lại lý do, cảnh báo ở mức WARN
     */
    public void logAccessDenied(Long datasetId, String datasetName, Long userId, String reason) {
        String timestamp = LocalDateTime.now().format(formatter);
        String logMessage = String.format(
            "[AUDIT] %s | DatasetId: %d | DatasetName: %s | UserId: %d | Action: ACCESS_DENIED | Reason: %s",
            timestamp, datasetId, datasetName, userId, reason
        );
        logger.warn(logMessage);
    }
}
