package com.evmarketplace.Controller;

import com.evmarketplace.Pojo.ProviderDataset;
import com.evmarketplace.Service.ProviderDatasetService;
import com.evmarketplace.Service.S3ProviderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/provider/datasets")
public class ProviderDatasetController {

    private final ProviderDatasetService datasetService;
    private final S3ProviderService s3Service;

    public ProviderDatasetController(ProviderDatasetService datasetService, S3ProviderService s3Service) {
        this.datasetService = datasetService;
        this.s3Service = s3Service;
    }

    // --- API 1: Upload metadata dataset ---
    @PostMapping
    public ResponseEntity<?> uploadMetadata(@RequestBody ProviderDataset dataset) {
        ProviderDataset saved = datasetService.save(dataset);
        return ResponseEntity.ok(saved);
    }

    // --- API 2: Upload file lên S3 ---
    @PostMapping("/{id}/upload")
    public ResponseEntity<?> uploadFile(@PathVariable Long id, @RequestParam("file") MultipartFile file)
            throws IOException {

        ProviderDataset dataset = datasetService.findById(id);
        if (dataset == null)
            return ResponseEntity.status(404).body("Dataset not found");

        String s3Url = s3Service.uploadFile(file);
        datasetService.updateS3Info(id, s3Url, file.getSize());

        return ResponseEntity.ok("✅ File uploaded to S3: " + s3Url);
    }

    // --- API 3: Cập nhật chính sách giá & quyền ---
    @PutMapping("/{id}/policy")
    public ResponseEntity<?> updatePolicy(
        @PathVariable Long id,
        @RequestBody ProviderDataset policyUpdate) {

    ProviderDataset dataset = datasetService.findById(id);
    if (dataset == null) {
        return ResponseEntity.status(404).body("Dataset not found");
    }

    // Cập nhật chính sách
    dataset.setPricingType(policyUpdate.getPricingType());
    dataset.setPrice(policyUpdate.getPrice());
    dataset.setUsagePolicy(policyUpdate.getUsagePolicy());

    ProviderDataset updated = datasetService.save(dataset);
    return ResponseEntity.ok(updated);
    }

}
