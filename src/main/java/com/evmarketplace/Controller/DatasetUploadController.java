package com.evmarketplace.Controller;

import com.evmarketplace.Service.S3StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

/**
 * Controller xử lý upload file dataset lên AWS S3.
 * Endpoint: POST /api/provider/datasets/{id}/upload
 */
@RestController
@RequestMapping("/api/provider/datasets")
public class DatasetUploadController {

    @Autowired
    private S3StorageService s3StorageService;

    /**
     * Upload file dataset lên S3 theo dataset ID.
     *
     * @param id   UUID của dataset
     * @param file MultipartFile được gửi từ client
     * @return URL file trên S3 hoặc thông báo lỗi
     */
    @PostMapping("/{id}/upload")
    public ResponseEntity<?> uploadDatasetFile(
            @PathVariable("id") UUID id,
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File rỗng. Vui lòng chọn file để upload.");
        }

        try {
            // Gọi service upload
            String fileUrl = s3StorageService.uploadFile(id, file);
            return ResponseEntity.ok().body("Upload thành công: " + fileUrl);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Upload thất bại: " + e.getMessage());
        }
    }
}
