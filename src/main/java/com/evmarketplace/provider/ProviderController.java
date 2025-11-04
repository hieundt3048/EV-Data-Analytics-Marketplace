package com.evmarketplace.provider;

import com.evmarketplace.Repository.ProviderDatasetRepository;
import com.evmarketplace.auth.SecurityUtils;
import com.evmarketplace.Service.UserService;
import com.evmarketplace.Service.S3ProviderService;
import com.evmarketplace.Pojo.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/provider")
public class ProviderController {

    private final UserService userService;
    private final ProviderDatasetRepository datasetRepository;
    private final S3ProviderService s3Service;
    
    @Autowired
    public ProviderController(UserService userService,
            ProviderDatasetRepository datasetRepository,
            S3ProviderService s3Service) {
        this.userService = userService;
        this.datasetRepository = datasetRepository;
        this.s3Service = s3Service;
    }

    // 1. Upload metadata dataset
    @PostMapping("/datasets")
    public ResponseEntity<?> createDataset(@RequestBody ProviderDataset dataset, HttpServletRequest req) {
        List<String> roles = SecurityUtils.getRolesFromRequest(req);
        if (!roles.contains("Provider")) {
            return ResponseEntity.status(403).body("Forbidden: requires Provider role");
        }

        String email = SecurityUtils.getEmailFromRequest(req);
        if (email == null)
            return ResponseEntity.status(401).build();

        User u = userService.findByEmail(email).orElse(null);
        if (u == null)
            return ResponseEntity.status(401).build();
        if (!u.isProviderApproved()) {
            return ResponseEntity.status(403).body("Provider account not approved");
        }

        // Gắn user vào dataset
        dataset.setUser(u);
        ProviderDataset saved = datasetRepository.save(dataset);

        return ResponseEntity.ok(saved);
    }

    // 2. Upload file thực tế lên S3
    @PostMapping("/datasets/{id}/upload")
    public ResponseEntity<?> uploadDatasetFile(@PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            HttpServletRequest req) throws IOException {
        List<String> roles = SecurityUtils.getRolesFromRequest(req);
        if (!roles.contains("Provider")) {
            return ResponseEntity.status(403).body("Forbidden: requires Provider role");
        }

        String email = SecurityUtils.getEmailFromRequest(req);
        if (email == null)
            return ResponseEntity.status(401).build();

        User u = userService.findByEmail(email).orElse(null);
        if (u == null)
            return ResponseEntity.status(401).build();

        ProviderDataset dataset = datasetRepository.findById(id).orElse(null);
        if (dataset == null) {
            return ResponseEntity.status(404).body("Dataset not found");
        }

        // Upload file lên S3 và cập nhật URL
        String s3Url = s3Service.uploadFile(file);
        dataset.setS3Url(s3Url);
        dataset.setSizeBytes(file.getSize());
        datasetRepository.save(dataset);

        return ResponseEntity.ok("Uploaded to S3: " + s3Url);
    }

    // Giữ nguyên endpoint /upload ban đầu
    @PostMapping("/upload")
    public ResponseEntity<?> uploadData(HttpServletRequest req) {
        List<String> roles = SecurityUtils.getRolesFromRequest(req);
        if (!roles.contains("Provider")) {
            return ResponseEntity.status(403).body("Forbidden: requires Provider role");
        }

        String email = SecurityUtils.getEmailFromRequest(req);
        if (email == null)
            return ResponseEntity.status(401).build();

        User u = userService.findByEmail(email).orElse(null);
        if (u == null)
            return ResponseEntity.status(401).build();

        if (!u.isProviderApproved()) {
            return ResponseEntity.status(403).body("Provider account not approved");
        }

        return ResponseEntity.ok("Upload accepted");
    }
}
