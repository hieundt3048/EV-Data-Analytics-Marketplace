// Khai báo package cho các controller liên quan đến nhà cung cấp.
package com.evmarketplace.provider;

// Nhập các lớp cần thiết.
import com.evmarketplace.auth.SecurityUtils; // Tiện ích để lấy thông tin bảo mật từ request.
import com.evmarketplace.Service.UserService; // Service để xử lý logic liên quan đến người dùng.
import com.evmarketplace.Pojo.User; // Lớp thực thể User.
import org.springframework.http.ResponseEntity; // Đại diện cho phản hồi HTTP.
import org.springframework.web.bind.annotation.PostMapping; // Annotation cho việc ánh xạ các yêu cầu HTTP POST.
import org.springframework.web.bind.annotation.RequestMapping; // Annotation để ánh xạ các yêu cầu web tới các phương thức xử lý.
import org.springframework.web.bind.annotation.RestController; // Đánh dấu lớp này là một REST controller.

import javax.servlet.http.HttpServletRequest; // Đại diện cho một yêu cầu HTTP.
import java.util.List; // Giao diện List của Java.

/**
 * Controller này xử lý các hoạt động dành cho nhà cung cấp (Provider),
 * chẳng hạn như tải lên dữ liệu.
 */
@RestController // Đánh dấu lớp này là một controller xử lý các yêu cầu REST.
@RequestMapping("/api/provider") // Tất cả các endpoint trong controller này sẽ có tiền tố là "/api/provider".
public class ProviderController {

    // Service để truy cập và quản lý dữ liệu người dùng.
    private final UserService userService;

    // Constructor injection: Spring sẽ tự động tiêm một instance của UserService.
    public ProviderController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Endpoint để nhà cung cấp tải lên dữ liệu.
     * @param req Đối tượng HttpServletRequest, chứa thông tin về yêu cầu, bao gồm cả token xác thực.
     * @return Một ResponseEntity cho biết kết quả của hoạt động.
     */
    @PostMapping("/upload") // Ánh xạ các yêu cầu HTTP POST đến "/api/provider/upload" vào phương thức này.
    public ResponseEntity<?> uploadData(HttpServletRequest req) {
        // Lấy danh sách vai trò của người dùng từ request.
        List<String> roles = SecurityUtils.getRolesFromRequest(req);
        // Kiểm tra xem người dùng có vai trò "Provider" hay không.
        if (!roles.contains("Provider")) {
            // Nếu không, trả về lỗi 403 Forbidden.
            return ResponseEntity.status(403).body("Forbidden: requires Provider role");
        }

        // Kiểm tra trạng thái phê duyệt của nhà cung cấp.
        // Lấy email của người dùng từ request.
        String email = SecurityUtils.getEmailFromRequest(req);
        // Nếu không có email, trả về lỗi 401 Unauthorized (không được xác thực).
        if (email == null) return ResponseEntity.status(401).build();
        // Tìm người dùng trong cơ sở dữ liệu bằng email.
        User u = userService.findByEmail(email).orElse(null);
        // Nếu không tìm thấy người dùng, trả về lỗi 401.
        if (u == null) return ResponseEntity.status(401).build();
        // Kiểm tra xem tài khoản nhà cung cấp đã được phê duyệt chưa.
        if (!u.isProviderApproved()) {
            // Nếu chưa, trả về lỗi 403 Forbidden.
            return ResponseEntity.status(403).body("Provider account not approved");
        }

        // Tại đây, bạn sẽ xử lý logic tải lên tệp/dữ liệu.
        // Để minh họa, chúng tôi chỉ trả về một thông báo thành công đơn giản.
        return ResponseEntity.ok("Upload accepted");
    }
}
