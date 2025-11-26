package com.evmarketplace.Controller;

import com.evmarketplace.Service.PayoutService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Controller Admin xử lý thanh toán và chia sẻ doanh thu
 * Quản lý doanh thu nền tảng, chi trả cho provider, và quản lý hoa hồng
 * Endpoint: /api/admin/payments/*
 */
@RestController
@RequestMapping("/api/admin/payments")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AdminPaymentController {
    
    private final PayoutService payoutService;
    
    /**
     * Constructor injection - khởi tạo PayoutService
     * @param payoutService Service xử lý logic thanh toán và chi trả
     */
    public AdminPaymentController(PayoutService payoutService) {
        this.payoutService = payoutService;
    }
    
    /**
     * Lấy thống kê doanh thu toàn nền tảng
     * GET /api/admin/payments/revenue-stats
     * 
     * @param startDate Ngày bắt đầu lọc (tùy chọn, format ISO DateTime)
     * @param endDate Ngày kết thúc lọc (tùy chọn, format ISO DateTime)
     * @return ResponseEntity chứa thống kê doanh thu bao gồm tổng doanh thu, doanh thu platform, doanh thu provider
     */
    @GetMapping("/revenue-stats")
    public ResponseEntity<Map<String, Object>> getPlatformRevenueStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        Map<String, Object> stats = payoutService.getPlatformRevenueStats(startDate, endDate);
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Lấy tổng hợp tất cả các khoản chi trả cho providers
     * GET /api/admin/payments/provider-payouts
     * Hiển thị danh sách tất cả providers và tổng số tiền cần chi trả
     * @return ResponseEntity chứa danh sách payouts của tất cả providers
     */
    @GetMapping("/provider-payouts")
    public ResponseEntity<List<Map<String, Object>>> getAllProviderPayouts() {
        List<Map<String, Object>> payouts = payoutService.getAllProviderPayouts();
        return ResponseEntity.ok(payouts);
    }
    
    /**
     * Lấy danh sách các khoản thanh toán đang chờ xử lý cho một provider cụ thể
     * GET /api/admin/payments/provider/{providerId}/payouts
     * Chỉ hiển thị các payouts có status = PENDING
     * 
     * @param providerId ID của provider cần xem payouts
     * @return ResponseEntity chứa danh sách các pending payouts của provider
     */
    @GetMapping("/provider/{providerId}/payouts")
    public ResponseEntity<List<Map<String, Object>>> getProviderPayouts(@PathVariable Long providerId) {
        List<Map<String, Object>> payouts = payoutService.getPendingPayouts(providerId);
        return ResponseEntity.ok(payouts);
    }
    
    /**
     * Lấy tổng quan doanh thu của một provider cụ thể
     * GET /api/admin/payments/provider/{providerId}/summary
     * Bao gồm: tổng doanh thu, đã chi trả, chờ chi trả, số lượng transactions
     * 
     * @param providerId ID của provider cần xem tổng quan
     * @return ResponseEntity chứa thông tin tổng quan doanh thu của provider
     */
    @GetMapping("/provider/{providerId}/summary")
    public ResponseEntity<Map<String, Object>> getProviderRevenueSummary(@PathVariable Long providerId) {
        Map<String, Object> summary = payoutService.getProviderRevenueSummary(providerId);
        return ResponseEntity.ok(summary);
    }
    
    /**
     * Xử lý và thực hiện chi trả các khoản đang chờ cho provider
     * POST /api/admin/payments/provider/{providerId}/process
     * Chuyển status của payouts từ PENDING sang COMPLETED và cập nhật ngày chi trả
     * 
     * @param providerId ID của provider cần xử lý payouts
     * @return ResponseEntity chứa kết quả xử lý (số lượng payouts đã xử lý, tổng số tiền)
     */
    @PostMapping("/provider/{providerId}/process")
    public ResponseEntity<Map<String, Object>> processProviderPayouts(@PathVariable Long providerId) {
        Map<String, Object> result = payoutService.processPayouts(providerId);
        return ResponseEntity.ok(result);
    }
}
