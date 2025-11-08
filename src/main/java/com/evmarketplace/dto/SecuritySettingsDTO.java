package com.evmarketplace.dto;

/**
 * DTO for Security & Anonymization settings
 */
public class SecuritySettingsDTO {
    
    private String anonymizationMethod;  // mask, hash, aggregate
    private String accessControl;        // open, whitelist, approval_required
    private Boolean auditEnabled;
    private String notes;
    
    public SecuritySettingsDTO() {}
    
    public SecuritySettingsDTO(String anonymizationMethod, String accessControl, 
                              Boolean auditEnabled, String notes) {
        this.anonymizationMethod = anonymizationMethod;
        this.accessControl = accessControl;
        this.auditEnabled = auditEnabled;
        this.notes = notes;
    }
    
    // Getters & Setters
    public String getAnonymizationMethod() {
        return anonymizationMethod;
    }
    
    public void setAnonymizationMethod(String anonymizationMethod) {
        this.anonymizationMethod = anonymizationMethod;
    }
    
    public String getAccessControl() {
        return accessControl;
    }
    
    public void setAccessControl(String accessControl) {
        this.accessControl = accessControl;
    }
    
    public Boolean getAuditEnabled() {
        return auditEnabled;
    }
    
    public void setAuditEnabled(Boolean auditEnabled) {
        this.auditEnabled = auditEnabled;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
}
