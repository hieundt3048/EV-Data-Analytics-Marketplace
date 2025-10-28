// Khai báo package cho các controller liên quan đến admin.
package com.evmarketplace.admin;

// Nhập các lớp và thư viện cần thiết.
import com.evmarketplace.Service.UserService; // Service cho các hoạt động liên quan đến người dùng.
import com.evmarketplace.auth.SecurityUtils; // Tiện ích cho các chức năng liên quan đến bảo mật như lấy vai trò người dùng từ một request.
import com.evmarketplace.Pojo.User; // Lớp thực thể User.
import org.springframework.http.ResponseEntity; // Đại diện cho toàn bộ phản hồi HTTP: mã trạng thái, header và body.
import org.springframework.web.bind.annotation.*; // Cung cấp các annotation cho Spring MVC controller (ví dụ: @RestController, @RequestMapping).
import org.slf4j.Logger; // Giao diện ghi log.
import org.slf4j.LoggerFactory; // Factory để tạo các instance của Logger.

import javax.servlet.http.HttpServletRequest; // Đại diện cho một yêu cầu HTTP.
import java.util.List; // Giao diện List của Java.
import java.util.Map; // Giao diện Map của Java.
import java.util.HashMap; // Triển khai HashMap của giao diện Map.
import java.util.stream.Collectors; // Cung cấp các collector cho các hoạt động stream;

/**
 * Controller này xử lý các tác vụ quản trị, chẳng hạn như liệt kê và phê duyệt các nhà cung cấp dữ liệu.
 * Tất cả các endpoint trong controller này đều có tiền tố là "/api/admin".
 */
@RestController("legacyAdminController") // Đặt tên bean riêng để tránh xung đột với AdminController mới trong gói Controller.
@RequestMapping("/api/admin/legacy") // Điều chỉnh tiền tố đường dẫn để không chồng chéo với API quản trị mới.
@CrossOrigin(origins = "http://localhost:5173") // Cho phép các yêu cầu cross-origin từ máy chủ phát triển frontend.
public class AdminController {

    // Instance logger cho lớp này để ghi lại thông tin và lỗi.
    private final Logger logger = LoggerFactory.getLogger(AdminController.class);

    // Service cung cấp các chức năng quản lý người dùng.
    private final UserService userService;

    // Constructor injection cho UserService. Spring sẽ cung cấp một instance của UserService.
    public AdminController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Phương thức trợ giúp riêng tư để kiểm tra xem người dùng thực hiện yêu cầu có vai trò "Admin" hay không.
     * Nó sử dụng SecurityUtils để trích xuất vai trò từ JWT trong yêu cầu.
     * @param req Yêu cầu HTTP đến.
     * @return true nếu người dùng là admin, ngược lại là false.
     */
    private boolean isAdmin(HttpServletRequest req) {
        // Trích xuất vai trò từ yêu cầu và kiểm tra xem có vai trò nào là "Admin" không.
        return SecurityUtils.getRolesFromRequest(req).stream().anyMatch(r -> "Admin".equals(r));
    }

    /**
     * Endpoint để lấy danh sách tất cả các nhà cung cấp dữ liệu đang chờ phê duyệt.
     * Đây là một endpoint chỉ dành cho admin.
     * @param req Yêu cầu HTTP đến, được sử dụng để xác thực/ủy quyền.
     * @return Một ResponseEntity chứa danh sách các nhà cung cấp đang chờ xử lý hoặc một trạng thái lỗi.
     */
    @GetMapping("/providers/pending") // Ánh xạ các yêu cầu HTTP GET vào phương thức này.
    public ResponseEntity<?> listPendingProviders(HttpServletRequest req) {
        // Ghi lại hành động, bao gồm cả người khởi tạo.
        logger.info("Admin listPendingProviders được gọi bởi {}", SecurityUtils.getEmailFromRequest(req));
        // Kiểm tra xem người dùng có phải là admin không. Nếu không, trả về trạng thái 403 Forbidden.
        if (!isAdmin(req)) return ResponseEntity.status(403).build();

        // Sử dụng userService để tìm tất cả người dùng.
    List<User> pending = userService.getAllUsers().stream()
                // Lọc để chỉ lấy những người dùng có vai trò "Provider".
                .filter(u -> u.getRoles().stream().anyMatch(r -> "Provider".equals(r.getName())))
                // Lọc thêm để chỉ lấy các nhà cung cấp chưa được phê duyệt.
                .filter(u -> !u.isProviderApproved())
                // Thu thập kết quả vào một danh sách.
                .collect(Collectors.toList());

        // Tạo một Đối tượng Truyền dữ liệu (DTO) để chỉ gửi thông tin cần thiết cho client.
        // Điều này tránh việc lộ toàn bộ đối tượng User.
        List<Map<String, Object>> dto = pending.stream().map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("name", u.getName());
            m.put("email", u.getEmail());
            m.put("organization", u.getOrganization());
            return m;
        }).collect(Collectors.toList());

        // Trả về danh sách các nhà cung cấp đang chờ xử lý với trạng thái 200 OK.
        return ResponseEntity.ok(dto);
    }

    /**
     * Endpoint để phê duyệt một nhà cung cấp dữ liệu.
     * Đây là một endpoint chỉ dành cho admin.
     * @param id ID của nhà cung cấp cần phê duyệt, được trích xuất từ đường dẫn URL.
     * @param req Yêu cầu HTTP đến, được sử dụng để xác thực/ủy quyền.
     * @return Một ResponseEntity cho biết thành công hay thất bại.
     */
    @PostMapping("/providers/{id}/approve") // Ánh xạ các yêu cầu HTTP POST vào phương thức này.
    public ResponseEntity<?> approveProvider(@PathVariable("id") Long id, HttpServletRequest req) {
        // Ghi lại hành động.
        logger.info("Admin approveProvider {} được gọi bởi {}", id, SecurityUtils.getEmailFromRequest(req));
        // Kiểm tra xem người dùng có phải là admin không. Nếu không, trả về trạng thái 403 Forbidden.
        if (!isAdmin(req)) return ResponseEntity.status(403).build();

        // Gọi service để phê duyệt nhà cung cấp.
        try {
            userService.approveProvider(id);
        } catch (RuntimeException ex) {
            return ResponseEntity.notFound().build();
        }
        // Nếu thành công, trả về trạng thái 200 OK.
        return ResponseEntity.ok().build();
    }
}
