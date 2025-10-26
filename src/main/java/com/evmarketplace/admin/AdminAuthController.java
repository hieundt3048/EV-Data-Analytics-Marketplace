package com.evmarketplace.admin;

import com.evmarketplace.Service.UserService;
import com.evmarketplace.auth.AuthRequest;
import com.evmarketplace.auth.AuthResponse;
import com.evmarketplace.auth.JwtUtil;
import com.evmarketplace.auth.SimpleUser;
import com.evmarketplace.Pojo.Role;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.util.ArrayList;
import java.util.List;

/**
 * Admin-specific login endpoint. Admins must log in via this endpoint (e.g., frontend at /admin/login).
 * This endpoint verifies the user has Admin role before issuing a token.
 */
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173") // allow Vite dev server during development
public class AdminAuthController {

    private final Logger logger = LoggerFactory.getLogger(AdminAuthController.class);

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AdminAuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        try {
            logger.info("Admin login attempt for: {}", request.getEmail());
            // imperative flow to avoid complex generics in lambdas
            com.evmarketplace.Pojo.User u = userService.findByEmail(request.getEmail()).orElse(null);
            if (u == null) return ResponseEntity.status(401).build();
            if (!userService.checkPassword(u, request.getPassword())) return ResponseEntity.status(401).build();

            boolean isAdmin = userService.getRolesForUser(u).stream().anyMatch(r -> "Admin".equals(r.getName()));
            if (!isAdmin) return ResponseEntity.status(403).build();

            List<String> roles = new ArrayList<>();
            for (Role r : userService.getRolesForUser(u)) roles.add(r.getName());
            String token = jwtUtil.generateToken(String.valueOf(u.getId()), u.getEmail(), roles);
            SimpleUser su = new SimpleUser(String.valueOf(u.getId()), u.getName(), u.getEmail());
            return ResponseEntity.ok(new AuthResponse(token, su));
        } catch (Exception ex) {
            logger.error("Admin login error for {}: {}", request.getEmail(), ex.toString());
            return ResponseEntity.status(500).body(null);
        }
    }
}
