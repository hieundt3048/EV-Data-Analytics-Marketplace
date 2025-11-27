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

/**
 * Controller quản lý datasets của Provider (nhà cung cấp dữ liệu).
 * Cung cấp các API để tạo, xem, upload, cập nhật chính sách, bảo mật và xóa datasets.
 */
@RestController
@RequestMapping("/api/provider/datasets")
public class ProviderDatasetController {

    private final ProviderDatasetService datasetService;
    private final S3ProviderService s3Service;
    private final AnonymizationService anonymizationService;

    // Constructor injection: Spring tự động inject các services
    public ProviderDatasetController(ProviderDatasetService datasetService,
                                     S3ProviderService s3Service,
                                     AnonymizationService anonymizationService) {
        this.datasetService = datasetService;
        this.s3Service = s3Service;
        this.anonymizationService = anonymizationService;
    }

    /**
     * Lấy danh sách tất cả datasets của provider.
     * @return List các ProviderDataset objects.
     */
    @GetMapping
    public ResponseEntity<?> getAllDatasets() {
        return ResponseEntity.ok(datasetService.findAll());
    }

    /**
     * Lấy thông tin chi tiết của một dataset theo ID.
     * @param id ID của dataset cần lấy.
     * @return ProviderDataset object hoặc 404 nếu không tìm thấy.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getDatasetById(@PathVariable Long id) {
        ProviderDataset ds = datasetService.findById(id);
        if (ds == null) return ResponseEntity.status(404).body("Dataset not found");
        return ResponseEntity.ok(ds);
    }

    /**
     * Tạo dataset mới.
     * @param dataset ProviderDataset object chứa thông tin dataset (name, category, description, price, etc.).
     * @return ProviderDataset đã được lưu vào database.
     */
    @PostMapping
    public ResponseEntity<?> createDataset(@RequestBody ProviderDataset dataset) {
        ProviderDataset saved = datasetService.save(dataset);
        return ResponseEntity.ok(saved);
    }

    /**
     * Upload file dữ liệu cho dataset lên S3.
     * Hỗ trợ tùy chọn anonymization (ẩn danh hóa) nếu cần.
     * @param id ID của dataset cần upload file.
     * @param file MultipartFile - file dữ liệu cần upload.
     * @param anonymize Boolean - có áp dụng anonymization hay không (default: false).
     * @return Message xác nhận upload thành công với S3 URL.
     */
    @PostMapping("/{id}/upload")
    public ResponseEntity<?> uploadFile(@PathVariable Long id,
                                        @RequestParam("file") MultipartFile file,
                                        @RequestParam(value = "anonymize", required = false, defaultValue = "false") boolean anonymize) throws IOException {
        ProviderDataset ds = datasetService.findById(id);
        if (ds == null) return ResponseEntity.status(404).body("Dataset not found");

        // Chuyển status sang UPLOADING
        ds.setStatus("UPLOADING");
        datasetService.save(ds);

        // Upload file lên S3
        S3Result r = s3Service.uploadFile(file);
        // Cập nhật S3 URL và file size vào database
        datasetService.updateS3Info(id, r.getUrl(), file.getSize());

        // Nếu anonymize = true, chạy anonymization async
        if (anonymize && r.getLocalPath() != null) {
            anonymizationService.anonymizeFileAsync(id, r.getLocalPath());
        }

        return ResponseEntity.ok("Uploaded: " + r.getUrl());
    }

    /**
     * Cập nhật chính sách giá và sử dụng của dataset.
     * @param id ID của dataset cần cập nhật.
     * @param policyUpdate ProviderDataset object chứa pricingType, price, usagePolicy.
     * @return ProviderDataset đã được cập nhật hoặc 404 nếu không tìm thấy.
     */
    @PutMapping("/{id}/policy")
    public ResponseEntity<?> updatePolicy(@PathVariable Long id, @RequestBody ProviderDataset policyUpdate) {
        ProviderDataset updated = datasetService.updatePolicy(id,
                policyUpdate.getPricingType(),
                policyUpdate.getPrice(),
                policyUpdate.getUsagePolicy());
        if (updated == null) return ResponseEntity.status(404).body("Dataset not found");
        return ResponseEntity.ok(updated);
    }

    /**
     * Cập nhật cài đặt bảo mật của dataset.
     * @param id ID của dataset cần cập nhật.
     * @param settings SecuritySettingsDTO chứa anonymizationMethod, accessControl, auditEnabled, notes.
     * @return ProviderDataset đã được cập nhật hoặc 404 nếu không tìm thấy.
     */
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

    /**
     * Xóa dữ liệu dataset theo GDPR (erase request).
     * Xóa local files và đánh dấu dataset status là ERASED.
     * @param id ID của dataset cần erase.
     * @param localPath Đường dẫn local file cần xóa (optional).
     * @return Message xác nhận erasure request.
     */
    @DeleteMapping("/{id}/erase")
    public ResponseEntity<?> eraseDataset(@PathVariable Long id, @RequestParam(value = "localPath", required = false) String localPath) {
        // Xóa local files nếu có
        if (localPath != null) {
            anonymizationService.eraseLocalFiles(localPath);
        }
        // Đánh dấu dataset là ERASED trong database
        datasetService.markErased(id);
        return ResponseEntity.ok("Erasure requested");
    }

    /**
     * Xóa dataset hoàn toàn khỏi hệ thống.
     * Xóa cả local files và record trong database.
     * @param id ID của dataset cần xóa.
     * @return Message xác nhận xóa thành công hoặc 404 nếu không tìm thấy.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDataset(@PathVariable Long id) {
        ProviderDataset ds = datasetService.findById(id);
        if (ds == null) {
            return ResponseEntity.status(404).body("Dataset not found");
        }
        
        // Xóa local file nếu tồn tại
        if (ds.getS3Url() != null) {
            // Extract local path từ S3 URL
            String localPath = ds.getS3Url().replace("uploads/", "");
            anonymizationService.eraseLocalFiles(localPath);
        }
        
        // Xóa khỏi database
        datasetService.delete(id);
        return ResponseEntity.ok("Dataset deleted successfully");
    }
}
