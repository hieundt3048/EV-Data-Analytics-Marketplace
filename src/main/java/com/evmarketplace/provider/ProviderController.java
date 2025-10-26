package com.evmarketplace.provider;

import com.evmarketplace.auth.SecurityUtils;
import com.evmarketplace.Service.UserService;
import com.evmarketplace.Pojo.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/provider")
public class ProviderController {

    private final UserService userService;

    public ProviderController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadData(HttpServletRequest req) {
        List<String> roles = SecurityUtils.getRolesFromRequest(req);
        if (!roles.contains("Provider")) {
            return ResponseEntity.status(403).body("Forbidden: requires Provider role");
        }

        // Check provider approval status
        String email = SecurityUtils.getEmailFromRequest(req);
        if (email == null) return ResponseEntity.status(401).build();
        User u = userService.findByEmail(email).orElse(null);
        if (u == null) return ResponseEntity.status(401).build();
        if (!u.isProviderApproved()) {
            return ResponseEntity.status(403).body("Provider account not approved");
        }

        // Here you'd handle file upload/payload. We'll return a simple success for demo.
        return ResponseEntity.ok("Upload accepted");
    }
}
