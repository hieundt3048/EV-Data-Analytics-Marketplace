package com.evmarketplace.Controller;

import com.evmarketplace.dto.ConsumerDashboardDTO;
import com.evmarketplace.Service.ConsumerDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller xử lý API dashboard cho Consumer (người mua dữ liệu).
 * Cung cấp thông tin tổng quan về các dataset đã mua, chi tiêu, và thống kê sử dụng.
 */
@RestController
@RequestMapping("/api/consumer/dashboard")
@CrossOrigin(origins = "http://localhost:5173") // Cho phép CORS từ frontend React
public class ConsumerDashboardController {

    private final ConsumerDashboardService dashboardService;

    // Constructor injection: Spring tự động inject ConsumerDashboardService
    public ConsumerDashboardController(ConsumerDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * Lấy thông tin dashboard của consumer hiện tại.
     * Bao gồm: số dataset đã mua, tổng chi tiêu, API usage, danh sách datasets, v.v.
     * @return ConsumerDashboardDTO chứa toàn bộ thông tin dashboard.
     */
    @GetMapping
    public ResponseEntity<ConsumerDashboardDTO> getConsumerDashboard() {
        try {
            // Lấy thông tin dashboard từ service (service tự động lấy user từ SecurityContext)
            ConsumerDashboardDTO dashboard = dashboardService.getConsumerDashboard();
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            // Trả về 400 Bad Request nếu có lỗi
            return ResponseEntity.badRequest().build();
        }
    }
}