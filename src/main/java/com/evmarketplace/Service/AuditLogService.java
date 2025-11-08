package com.evmarketplace.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Service for audit logging
 * Logs security-related actions for compliance
 */
@Service
public class AuditLogService {

    private static final Logger logger = LoggerFactory.getLogger(AuditLogService.class);
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * Log dataset access
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
     * Log security settings change
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
     * Log dataset erasure (GDPR)
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
     * Log PII anonymization
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
     * Log failed access attempt
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
