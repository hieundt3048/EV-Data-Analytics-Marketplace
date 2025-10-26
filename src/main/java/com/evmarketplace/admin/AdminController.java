package com.evmarketplace.admin;

import com.evmarketplace.Service.UserService;
import com.evmarketplace.auth.SecurityUtils;
import com.evmarketplace.Pojo.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

/**
 * Admin management endpoints: list pending providers and approve them.
 */
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final Logger logger = LoggerFactory.getLogger(AdminController.class);

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    private boolean isAdmin(HttpServletRequest req) {
        return SecurityUtils.getRolesFromRequest(req).stream().anyMatch(r -> "Admin".equals(r));
    }

    @GetMapping("/providers/pending")
    public ResponseEntity<?> listPendingProviders(HttpServletRequest req) {
        logger.info("Admin listPendingProviders called by {}", SecurityUtils.getEmailFromRequest(req));
        if (!isAdmin(req)) return ResponseEntity.status(403).build();

        List<User> pending = userService.findAllUsers().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> "Provider".equals(r.getName())))
                .filter(u -> !u.isProviderApproved())
                .collect(Collectors.toList());

    // return minimal info (avoid Java 9+ APIs for Java 8 compatibility)
    List<Map<String, Object>> dto = pending.stream().map(u -> {
        Map<String, Object> m = new HashMap<>();
        m.put("id", u.getId());
        m.put("name", u.getName());
        m.put("email", u.getEmail());
        m.put("organization", u.getOrganization());
        return m;
    }).collect(Collectors.toList());

    return ResponseEntity.ok(dto);
    }

    @PostMapping("/providers/{id}/approve")
    public ResponseEntity<?> approveProvider(@PathVariable("id") Long id, HttpServletRequest req) {
        logger.info("Admin approveProvider {} called by {}", id, SecurityUtils.getEmailFromRequest(req));
        if (!isAdmin(req)) return ResponseEntity.status(403).build();

        boolean ok = userService.approveProvider(id);
        if (!ok) return ResponseEntity.notFound().build();
        return ResponseEntity.ok().build();
    }
}
