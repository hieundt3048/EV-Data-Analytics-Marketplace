package com.evmarketplace.Service;

import com.evmarketplace.Repository.ProviderDatasetRepository;
import com.evmarketplace.Repository.OrderRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class GDPRComplianceService {

    private final ProviderDatasetRepository datasetRepo;
    private final OrderRepository orderRepo;
    private final AnonymizationService anonymizationService;

    public GDPRComplianceService(ProviderDatasetRepository datasetRepo,
                                 OrderRepository orderRepo,
                                 AnonymizationService anonymizationService) {
        this.datasetRepo = datasetRepo;
        this.orderRepo = orderRepo;
        this.anonymizationService = anonymizationService;
    }

    // Run async to avoid blocking request
    @Async("anonExecutor")
    public void anonymizeUserData(UUID userId) {
        // Example steps (customize for your schema):
        // 1) Find datasets owned by this user and erase files / mark ERASED.
        datasetRepo.findAll().stream()
                .filter(d -> d.getProviderId() != null && d.getProviderId().toString().equals(userId.toString()))
                .forEach(d -> {
                    // if s3Url is a mock local path, try to delete
                    String s3 = d.getS3Url();
                    if (s3 != null && s3.startsWith("mock://local/")) {
                        String local = s3.replace("mock://local/", "");
                        anonymizationService.eraseLocalFiles(local);
                    }
                    d.setStatus("ERASED");
                    datasetRepo.save(d);
                });

        // 2) Optionally, anonymize orders / purchase records (e.g., set buyerId=null or mask)
        // Here as example we don't delete orders, but real impl depends on business rules.
    }
}
