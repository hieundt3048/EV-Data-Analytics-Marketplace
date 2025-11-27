package com.evmarketplace.Controller;

import com.evmarketplace.Service.SubscriptionService;
import com.evmarketplace.dto.CheckoutResponseDTO;
import com.evmarketplace.dto.SubscriptionRequestDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.servlet.http.HttpServletRequest;

/**
 * Controller quản lý Subscription (gói đăng ký định kỳ).
 * Cung cấp các API để tạo, xem, hủy và xóa subscription, cũng như xử lý webhook từ Stripe.
 */
@RestController 
@RequestMapping("/api/subscriptions")
@CrossOrigin(origins = "http://localhost:5173") // Cho phép CORS từ frontend
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    // Constructor injection: Spring tự động inject SubscriptionService
    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    /**
     * Tạo subscription mới cho dataset.
     * @param subscriptionRequest DTO chứa thông tin subscription (datasetId, duration, price, etc.).
     * @param request HttpServletRequest để lấy thông tin user.
     * @return CheckoutResponseDTO chứa subscription ID, payment URL, status, message.
     */
    @PostMapping
    public ResponseEntity<CheckoutResponseDTO> createSubscription(
            @Valid @RequestBody SubscriptionRequestDTO subscriptionRequest,
            HttpServletRequest request) {
        try {
            // Gọi service để tạo subscription và xử lý thanh toán
            CheckoutResponseDTO response = subscriptionService.createSubscription(subscriptionRequest, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Trả về error response nếu có lỗi
            return ResponseEntity.badRequest().body(
                new CheckoutResponseDTO(null, null, "error", e.getMessage(), null)
            );
        }
    }

    /**
     * Lấy danh sách tất cả subscriptions của user hiện tại.
     * @return List các Subscription objects.
     */
    @GetMapping
    public ResponseEntity<java.util.List<com.evmarketplace.Pojo.Subscription>> getUserSubscriptions() {
        try {
            // Service tự động lấy user từ SecurityContext
            java.util.List<com.evmarketplace.Pojo.Subscription> subscriptions = subscriptionService.getUserSubscriptions();
            return ResponseEntity.ok(subscriptions);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Hủy subscription (chuyển status sang CANCELLED).
     * Subscription sẽ không tự động gia hạn nhưng vẫn còn hiệu lực đến endAt.
     * @param subscriptionId ID của subscription cần hủy.
     * @return Message xác nhận hủy thành công.
     */
    @PostMapping("/{subscriptionId}/cancel")
    public ResponseEntity<String> cancelSubscription(@PathVariable Long subscriptionId) {
        try {
            subscriptionService.cancelSubscription(subscriptionId);
            return ResponseEntity.ok("Subscription cancelled successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error cancelling subscription: " + e.getMessage());
        }
    }

    /**
     * Xóa subscription hoàn toàn khỏi database.
     * Chỉ nên dùng cho subscriptions đã hết hạn hoặc cancelled.
     * @param subscriptionId ID của subscription cần xóa.
     * @return Message xác nhận xóa thành công.
     */
    @DeleteMapping("/{subscriptionId}")
    public ResponseEntity<String> deleteSubscription(@PathVariable Long subscriptionId) {
        try {
            subscriptionService.deleteSubscription(subscriptionId);
            return ResponseEntity.ok("Subscription deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting subscription: " + e.getMessage());
        }
    }

    /**
     * Tạo dữ liệu subscription mẫu cho testing/demo.
     * Phương thức helper không được expose qua API.
     * @return List các subscription mẫu với status ACTIVE.
     */
    private java.util.List<com.evmarketplace.Pojo.Subscription> createSampleSubscriptions() {
        java.util.List<com.evmarketplace.Pojo.Subscription> subscriptions = new java.util.ArrayList<>();

        // Sample subscription 1 - Active
        com.evmarketplace.Pojo.Subscription sub1 = new com.evmarketplace.Pojo.Subscription();
        sub1.setId(1L);
        sub1.setStartAt(java.time.LocalDateTime.now().minusDays(10));
        sub1.setEndAt(java.time.LocalDateTime.now().plusDays(20));
        sub1.setPrice(29.99);
        sub1.setStatus("ACTIVE");

        // Create sample dataset for subscription
        com.evmarketplace.Pojo.Dataset dataset1 = new com.evmarketplace.Pojo.Dataset();
        dataset1.setId(101L);
        dataset1.setTitle("Premium Battery Analytics");
        sub1.setDataset(dataset1);
        subscriptions.add(sub1);

        // Sample subscription 2 - Active
        com.evmarketplace.Pojo.Subscription sub2 = new com.evmarketplace.Pojo.Subscription();
        sub2.setId(2L);
        sub2.setStartAt(java.time.LocalDateTime.now().minusDays(5));
        sub2.setEndAt(java.time.LocalDateTime.now().plusDays(25));
        sub2.setPrice(49.99);
        sub2.setStatus("ACTIVE");

        com.evmarketplace.Pojo.Dataset dataset2 = new com.evmarketplace.Pojo.Dataset();
        dataset2.setId(102L);
        dataset2.setTitle("EV Charging Network Data");
        sub2.setDataset(dataset2);
        subscriptions.add(sub2);

        return subscriptions;
    }

    /**
     * Xử lý webhook từ Stripe cho subscription events.
     * Stripe gửi webhook khi có sự kiện: subscription created, updated, cancelled, payment failed, etc.
     * @param payload JSON payload từ Stripe.
     * @param sigHeader Stripe signature để verify tính hợp lệ của webhook.
     * @return Message xác nhận xử lý webhook thành công.
     */
    @PostMapping("/webhook/stripe")
    public ResponseEntity<String> handleStripeSubscriptionWebhook(@RequestBody String payload,
                                                                 @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            // Verify signature và xử lý webhook event
            subscriptionService.handleStripeWebhook(payload, sigHeader);
            return ResponseEntity.ok("Subscription webhook processed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Webhook error: " + e.getMessage());
        }
    }
}