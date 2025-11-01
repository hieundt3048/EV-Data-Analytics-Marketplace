package com.evmarketplace.Controller;

import com.evmarketplace.Service.GDPRComplianceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller phục vụ yêu cầu "quyền được quên" (GDPR).
 */
@RestController
@RequestMapping("/api/privacy")
public class GDPRController {

    @Autowired
    private GDPRComplianceService gdprService;

    // Endpoint: POST /api/privacy/forget/{userId}
    @PostMapping("/forget/{userId}")
    public ResponseEntity<String> forgetUser(@PathVariable UUID userId) {
        gdprService.anonymizeUserData(userId);
        return ResponseEntity.ok("Yêu cầu ẩn danh hóa dữ liệu người dùng đã được xử lý (GDPR).");
    }
}
