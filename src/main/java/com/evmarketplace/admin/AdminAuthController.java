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
 * Đây là controller xử lý endpoint đăng nhập dành riêng cho Quản trị viên (Admin).
 */
// Đánh dấu đây là một Rest Controller, xử lý các request HTTP và trả về JSON.
@RestController
// Định nghĩa đường dẫn cơ sở cho tất cả các API trong controller này.
@RequestMapping("/api/admin")
// Cho phép các request từ địa chỉ của Vite dev server (frontend).
@CrossOrigin(origins = "http://localhost:5173")
public class AdminAuthController {

    // Khởi tạo logger để ghi lại các thông tin hoạt động.
    private final Logger logger = LoggerFactory.getLogger(AdminAuthController.class);

    // Khai báo các dependency sẽ được inject vào.
    private final UserService userService;
    private final JwtUtil jwtUtil;
    
    public AdminAuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    // Xử lý request POST đến "/api/admin/login".
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        try {
            logger.info("Admin login attempt for: {}", request.getEmail()); // Ghi log về việc thử đăng nhập.
            
            // Tìm người dùng bằng email. Nếu không tìm thấy, trả về null.
            com.evmarketplace.Pojo.User u = userService.findByEmail(request.getEmail()).orElse(null);
            // Nếu không có người dùng hoặc mật khẩu không đúng, trả về lỗi 401 Unauthorized.
            if (u == null) return ResponseEntity.status(401).build();
            if (!userService.checkPassword(u, request.getPassword())) return ResponseEntity.status(401).build();

            //Xác minh người dùng có vai trò "Admin" hay không.
            boolean isAdmin = userService.getRolesForUser(u).stream().anyMatch(r -> "Admin".equals(r.getName()));
            // Nếu không phải Admin, trả về lỗi 403 Forbidden (Cấm truy cập).
            if (!isAdmin) return ResponseEntity.status(403).build();

            // Nếu xác thực thành công và đúng là Admin:
            // Lấy danh sách vai trò.
            List<String> roles = new ArrayList<>();
            for (Role r : userService.getRolesForUser(u)) roles.add(r.getName());
            // Tạo JWT token với tên, email và vai trò của người dùng.
            String token = jwtUtil.generateToken(u.getName(), u.getEmail(), roles);
            // Tạo đối tượng SimpleUser để trả về cho frontend.
            SimpleUser su = new SimpleUser(String.valueOf(u.getId()), u.getName(), u.getEmail());
            // Trả về response 200 OK cùng với token và thông tin người dùng.
            return ResponseEntity.ok(new AuthResponse(token, su));
        } catch (Exception ex) {
            // Ghi lại lỗi nếu có bất kỳ lỗi không mong muốn nào xảy ra.
            logger.error("Admin login error for {}: {}", request.getEmail(), ex.toString());
            // Trả về lỗi 500 Internal Server Error.
            return ResponseEntity.status(500).body(null);
        }
    }
}
