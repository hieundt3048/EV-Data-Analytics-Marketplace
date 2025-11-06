package com.evmarketplace.Controller;

import com.evmarketplace.Service.GDPRComplianceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/privacy")
public class GDPRController {

    private final GDPRComplianceService gdprService;

    public GDPRController(GDPRComplianceService gdprService) {
        this.gdprService = gdprService;
    }

    @PostMapping("/forget/{userId}")
    public ResponseEntity<String> forgetUser(@PathVariable UUID userId) {
        gdprService.anonymizeUserData(userId);
        return ResponseEntity.ok("GDPR erase request accepted");
    }
}
