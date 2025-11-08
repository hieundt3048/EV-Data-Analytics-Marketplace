package com.evmarketplace.Controller;

import com.evmarketplace.Pojo.ProviderDataset;
import com.evmarketplace.dto.SecuritySettingsDTO;
import com.evmarketplace.Service.AnonymizationService;
import com.evmarketplace.Service.ProviderDatasetService;
import com.evmarketplace.Service.S3ProviderService;
import com.evmarketplace.Service.S3ProviderService.S3Result;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/provider/datasets")
public class ProviderDatasetController {

    private final ProviderDatasetService datasetService;
    private final S3ProviderService s3Service;
    private final AnonymizationService anonymizationService;

    public ProviderDatasetController(ProviderDatasetService datasetService,
                                     S3ProviderService s3Service,
                                     AnonymizationService anonymizationService) {
        this.datasetService = datasetService;
        this.s3Service = s3Service;
        this.anonymizationService = anonymizationService;
    }

    // GET /api/provider/datasets - Get all datasets
    @GetMapping
    public ResponseEntity<?> getAllDatasets() {
        return ResponseEntity.ok(datasetService.findAll());
    }

    // GET /api/provider/datasets/{id} - Get dataset by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getDatasetById(@PathVariable Long id) {
        ProviderDataset ds = datasetService.findById(id);
        if (ds == null) return ResponseEntity.status(404).body("Dataset not found");
        return ResponseEntity.ok(ds);
    }

    // POST /api/provider/datasets
    @PostMapping
    public ResponseEntity<?> createDataset(@RequestBody ProviderDataset dataset) {
        ProviderDataset saved = datasetService.save(dataset);
        return ResponseEntity.ok(saved);
    }

    // POST /api/provider/datasets/{id}/upload
    @PostMapping("/{id}/upload")
    public ResponseEntity<?> uploadFile(@PathVariable Long id,
                                        @RequestParam("file") MultipartFile file,
                                        @RequestParam(value = "anonymize", required = false, defaultValue = "false") boolean anonymize) throws IOException {
        ProviderDataset ds = datasetService.findById(id);
        if (ds == null) return ResponseEntity.status(404).body("Dataset not found");

        ds.setStatus("UPLOADING");
        datasetService.save(ds);

        S3Result r = s3Service.uploadFile(file);
        datasetService.updateS3Info(id, r.getUrl(), file.getSize());

        if (anonymize && r.getLocalPath() != null) {
            anonymizationService.anonymizeFileAsync(id, r.getLocalPath());
        }

        return ResponseEntity.ok("Uploaded: " + r.getUrl());
    }

    // PUT /api/provider/datasets/{id}/policy
    @PutMapping("/{id}/policy")
    public ResponseEntity<?> updatePolicy(@PathVariable Long id, @RequestBody ProviderDataset policyUpdate) {
        ProviderDataset updated = datasetService.updatePolicy(id,
                policyUpdate.getPricingType(),
                policyUpdate.getPrice(),
                policyUpdate.getUsagePolicy());
        if (updated == null) return ResponseEntity.status(404).body("Dataset not found");
        return ResponseEntity.ok(updated);
    }

    // PUT /api/provider/datasets/{id}/security - Update security settings
    @PutMapping("/{id}/security")
    public ResponseEntity<?> updateSecuritySettings(@PathVariable Long id, @RequestBody SecuritySettingsDTO settings) {
        ProviderDataset updated = datasetService.updateSecuritySettings(id,
                settings.getAnonymizationMethod(),
                settings.getAccessControl(),
                settings.getAuditEnabled(),
                settings.getNotes());
        if (updated == null) return ResponseEntity.status(404).body("Dataset not found");
        return ResponseEntity.ok(updated);
    }

    // DELETE /api/provider/datasets/{id}/erase (simple GDPR erase)
    @DeleteMapping("/{id}/erase")
    public ResponseEntity<?> eraseDataset(@PathVariable Long id, @RequestParam(value = "localPath", required = false) String localPath) {
        // remove local files if any and mark ERASED
        if (localPath != null) {
            anonymizationService.eraseLocalFiles(localPath);
        }
        datasetService.markErased(id);
        return ResponseEntity.ok("Erasure requested");
    }

    // DELETE /api/provider/datasets/{id} - Delete dataset completely
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDataset(@PathVariable Long id) {
        ProviderDataset ds = datasetService.findById(id);
        if (ds == null) {
            return ResponseEntity.status(404).body("Dataset not found");
        }
        
        // Optionally delete local file if exists
        if (ds.getS3Url() != null) {
            // Extract local path from S3 URL if needed
            String localPath = ds.getS3Url().replace("uploads/", "");
            anonymizationService.eraseLocalFiles(localPath);
        }
        
        // Delete from database
        datasetService.delete(id);
        return ResponseEntity.ok("Dataset deleted successfully");
    }
}
