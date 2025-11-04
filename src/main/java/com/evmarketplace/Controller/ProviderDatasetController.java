package com.evmarketplace.Controller;

import com.evmarketplace.provider.ProviderDataset;
import com.evmarketplace.Service.ProviderDatasetService;
import com.evmarketplace.Service.S3ProviderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/provider/datasets/upload")
public class ProviderDatasetController {

    private final ProviderDatasetService datasetService;
    private final S3ProviderService s3Service;

    public ProviderDatasetController(ProviderDatasetService datasetService, S3ProviderService s3Service) {
        this.datasetService = datasetService;
        this.s3Service = s3Service;
    }

    // --- 1️⃣ Upload metadata ---
    @PostMapping
    public ResponseEntity<?> uploadMetadata(@RequestBody ProviderDataset dataset) {
        ProviderDataset saved = datasetService.save(dataset);
        return ResponseEntity.ok(saved);
    }

    // --- 2️⃣ Upload file lên S3 ---
    @PostMapping("/{id}/upload")
    public ResponseEntity<?> uploadFile(@PathVariable UUID id, @RequestParam("file") MultipartFile file)
            throws IOException {
        ProviderDataset dataset = datasetService.findById(id);
        if (dataset == null)
            return ResponseEntity.status(404).body("Dataset not found");

        // upload to S3
        String key = "datasets/" + id + "/" + file.getOriginalFilename();
        String s3Url = s3Service.uploadFile(key, file);

        // cập nhật đường dẫn S3 trong DB
        dataset.setS3Url(s3Url);
        dataset.setSizeBytes(file.getSize());
        datasetService.save(dataset);

        return ResponseEntity.ok("✅ File uploaded to S3: " + s3Url);
    }
}
