package com.evmarketplace.auth;

import com.evmarketplace.Service.UserService;
import com.evmarketplace.Pojo.Role;
import com.evmarketplace.Pojo.User;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import javax.validation.Valid;
import java.util.UUID;

// Đánh dấu đây là một Rest Controller, xử lý các request HTTP và trả về JSON.
@RestController
// Cho phép các request từ địa chỉ của Vite dev server (frontend).
@CrossOrigin(origins = "http://localhost:5173") 
// Định nghĩa đường dẫn cơ sở cho tất cả các API trong controller này.
@RequestMapping("/api/auth")
public class AuthController {

    // Khai báo các dependency sẽ được inject vào.
    private final UserService userService; // Dịch vụ xử lý logic liên quan đến người dùng.
    private final JwtUtil jwtUtil; // Tiện ích để tạo và xử lý JWT.
    private final Logger logger = LoggerFactory.getLogger(AuthController.class); // Để ghi log.

    // Constructor Injection: Spring sẽ tự động inject các bean cần thiết vào đây.
    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    // Xử lý request POST đến "/api/auth/login".
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        // Kiểm tra xem mật khẩu có được gửi lên không.
        if (request.getPassword() == null) {
            return ResponseEntity.status(400).build(); // Trả về lỗi 400 Bad Request.
        }

        // Tìm người dùng bằng email.
        return userService.findByEmail(request.getEmail())
                // Nếu tìm thấy, kiểm tra mật khẩu có khớp không.
                .filter(u -> userService.checkPassword(u, request.getPassword()))
                // Nếu mật khẩu khớp, thực hiện các bước tiếp theo.
                .map(u -> {
                    // Lấy danh sách vai trò của người dùng.
                    java.util.List<String> roles = new java.util.ArrayList<>();
                    for (Role r : userService.getRolesForUser(u)) roles.add(r.getName());

                    // Tạo JWT token với tên, email và vai trò của người dùng.
                    String token = jwtUtil.generateToken(u.getName(), u.getEmail(), roles);
                    // Tạo một đối tượng SimpleUser để trả về cho frontend.
                    SimpleUser su = new SimpleUser(u.getId() == null ? "" + UUID.randomUUID() : String.valueOf(u.getId()), u.getName(), u.getEmail());
                    // Trả về response 200 OK cùng với token và thông tin người dùng.
                    return ResponseEntity.ok(new AuthResponse(token, su));
                })
                // Nếu không tìm thấy người dùng hoặc mật khẩu không khớp, trả về lỗi 401 Unauthorized.
                .orElseGet(() -> ResponseEntity.status(401).build());
    }

    // Xử lý request POST đến "/api/auth/register".
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthRegisterRequest req) {
        // Kiểm tra xem email và mật khẩu có được gửi lên không.
        if (req.getPassword() == null || req.getEmail() == null) {
            return ResponseEntity.badRequest().body("Missing email or password");
        }

        try {
            // Gọi service để đăng ký người dùng mới.
            com.evmarketplace.Pojo.User u = userService.register(req.getName(), req.getEmail(), req.getPassword(), req.getOrganization(), false);

            // Gán vai trò dựa trên lựa chọn của người dùng.
            if (req.isWantsConsumer()) {
                userService.assignRoleToUser(u, "Consumer");
            }
            if (req.isWantsProvider()) {
                // Tài khoản Provider được tạo nhưng ở trạng thái chờ duyệt (providerApproved=false).
                userService.assignRoleToUser(u, "Provider");
                u.setProviderApproved(false);
            }

            // Trả về response 201 Created để báo hiệu đăng ký thành công.
            return ResponseEntity.status(201).build();
        } catch (DataIntegrityViolationException dive) {
            // Bắt lỗi nếu vi phạm ràng buộc CSDL (thường là email đã tồn tại).
            logger.warn("Registration failed - data integrity violation: {}", dive.getMessage());
            return ResponseEntity.status(409).body("A user with that email may already exist or data violated constraints.");
        } catch (Exception ex) {
            // Bắt các lỗi không mong muốn khác.
            logger.error("Unexpected error during registration", ex);
            return ResponseEntity.status(500).body("Registration failed due to server error: " + ex.getMessage());
        }
    }
}
