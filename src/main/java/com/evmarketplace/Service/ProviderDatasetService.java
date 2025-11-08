package com.evmarketplace.Service;

import com.evmarketplace.Pojo.ProviderDataset;
import com.evmarketplace.Repository.ProviderDatasetRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProviderDatasetService {

    private final ProviderDatasetRepository repo;

    public ProviderDatasetService(ProviderDatasetRepository repo) {
        this.repo = repo;
    }

    public ProviderDataset save(ProviderDataset dataset) {
        return repo.save(dataset);
    }

    public ProviderDataset findById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public List<ProviderDataset> findAll() {
        return repo.findAll();
    }

    public List<ProviderDataset> findByProviderId(Long providerId) {
        return repo.findByProviderId(providerId);
    }

    public List<ProviderDataset> findByStatus(String status) {
        return repo.findByStatus(status);
    }

    public ProviderDataset updateS3Info(Long id, String s3Url, long sizeBytes) {
        ProviderDataset d = findById(id);
        if (d == null) return null;
        d.setS3Url(s3Url);
        d.setSizeBytes(sizeBytes);
        d.setStatus("PENDING_REVIEW"); // Chuyển sang trạng thái chờ admin duyệt
        return repo.save(d);
    }

    public ProviderDataset updatePolicy(Long id, String pricingType, Double price, String usagePolicy) {
        ProviderDataset d = findById(id);
        if (d == null) return null;
        d.setPricingType(pricingType);
        d.setPrice(price);
        d.setUsagePolicy(usagePolicy);
        return repo.save(d);
    }

    public ProviderDataset updateSecuritySettings(Long id, String anonymizationMethod, 
                                                  String accessControl, Boolean auditEnabled, 
                                                  String securityNotes) {
        ProviderDataset d = findById(id);
        if (d == null) return null;
        d.setAnonymizationMethod(anonymizationMethod);
        d.setAccessControl(accessControl);
        d.setAuditEnabled(auditEnabled != null ? auditEnabled : false);
        d.setSecurityNotes(securityNotes);
        return repo.save(d);
    }

    public void markErased(Long id) {
        ProviderDataset d = findById(id);
        if (d != null) {
            d.setStatus("ERASED");
            repo.save(d);
        }
    }

    public ProviderDataset approveDataset(Long id) {
        ProviderDataset d = findById(id);
        if (d == null) return null;
        d.setStatus("APPROVED");
        return repo.save(d);
    }

    public ProviderDataset rejectDataset(Long id, String reason) {
        ProviderDataset d = findById(id);
        if (d == null) return null;
        d.setStatus("REJECTED");
        // Có thể thêm field rejectionReason nếu cần
        return repo.save(d);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
