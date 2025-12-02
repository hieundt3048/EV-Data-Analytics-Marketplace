package com.evmarketplace.Controller;

import com.evmarketplace.Pojo.Dataset;
import com.evmarketplace.Pojo.Order;
import com.evmarketplace.Pojo.ProviderDataset;
import com.evmarketplace.Repository.DatasetRepository;
import com.evmarketplace.Repository.OrderRepository;
import com.evmarketplace.Repository.ProviderDatasetRepository;
import com.evmarketplace.Service.OrderService;
import com.evmarketplace.dto.CheckoutResponseDTO;
import com.evmarketplace.dto.OrderHistoryDTO;
import com.evmarketplace.dto.OrderRequestDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller xử lý đặt hàng và checkout cho dataset.
 * Cung cấp các API để tạo order, thanh toán, xem lịch sử mua hàng và xử lý webhook từ Stripe.
 */
@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173") // Cho phép CORS từ frontend
public class OrderCheckoutController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final DatasetRepository datasetRepository;
    private final ProviderDatasetRepository providerDatasetRepository;

    // Constructor injection: Spring tự động inject các dependencies
    public OrderCheckoutController(OrderService orderService, OrderRepository orderRepository, 
                                   DatasetRepository datasetRepository, ProviderDatasetRepository providerDatasetRepository) {
        this.orderService = orderService;
        this.orderRepository = orderRepository;
        this.datasetRepository = datasetRepository;
        this.providerDatasetRepository = providerDatasetRepository;
    }

    /**
     * Tạo order và xử lý checkout (thanh toán).
     * @param orderRequest OrderRequestDTO chứa datasetId, paymentMethod, amount, etc.
     * @return CheckoutResponseDTO chứa orderId, checkoutUrl, status, message.
     */
    @PostMapping("/checkout")
    public ResponseEntity<CheckoutResponseDTO> checkout(@Valid @RequestBody OrderRequestDTO orderRequest) {
        try {
            // Gọi service để tạo order và xử lý thanh toán qua Stripe
            CheckoutResponseDTO response = orderService.createOrderAndCheckout(orderRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Trả về error response nếu có lỗi
            return ResponseEntity.badRequest().body(
                new CheckoutResponseDTO(null, null, "error", e.getMessage(), null)
            );
        }
    }

    /**
     * Lấy lịch sử mua hàng của user.
     * Hiện tại trả về tất cả orders (TODO: filter theo user đang đăng nhập).
     * @return List các OrderHistoryDTO chứa thông tin order và dataset.
     */
    @GetMapping("/history")
    public ResponseEntity<List<OrderHistoryDTO>> getPurchaseHistory() {
        try {
            // Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            // Hiện tại lấy tất cả orders (sẽ filter theo user sau)
            List<Order> orders = orderRepository.findAll();

            // Nếu không có orders, trả về empty list
            if (orders.isEmpty()) {
                return ResponseEntity.ok(new java.util.ArrayList<>());
            }

            // Convert Order sang OrderHistoryDTO với thông tin dataset
            List<OrderHistoryDTO> orderHistory = orders.stream().map(order -> {
                String datasetTitle = "Unknown Dataset";
                String category = null;
                String pricingType = null;
                
                try {
                    // Thử lấy từ ProviderDataset trước (vì Order.datasetId có thể trỏ đến ProviderDataset)
                    ProviderDataset providerDataset = providerDatasetRepository.findById(order.getDatasetId()).orElse(null);
                    if (providerDataset != null) {
                        datasetTitle = providerDataset.getName();
                        category = providerDataset.getCategory();
                        pricingType = providerDataset.getPricingType();
                    } else {
                        // Nếu không tìm thấy, thử lấy từ Dataset (bảng cũ)
                        Dataset dataset = datasetRepository.findById(order.getDatasetId()).orElse(null);
                        if (dataset != null) {
                            datasetTitle = dataset.getTitle();
                            // Dataset có category qua relationship
                            if (dataset.getCategory() != null) {
                                category = dataset.getCategory().getName();
                            }
                        }
                    }
                } catch (Exception e) {
                    // Ignore exception và sử dụng default values
                }

                // Tạo DTO với thông tin đầy đủ
                return new OrderHistoryDTO(
                    order.getId(),
                    order.getDatasetId(),
                    datasetTitle,
                    order.getAmount(),
                    order.getOrderDate(),
                    order.getStatus(),
                    category,
                    pricingType
                );
            }).collect(Collectors.toList());

            return ResponseEntity.ok(orderHistory);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Xóa order theo ID.
     * TODO: Verify user là owner hoặc admin trước khi cho phép xóa (security).
     * @param id ID của order cần xóa.
     * @return 204 No Content nếu xóa thành công, 404 nếu không tìm thấy.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        try {
            // Kiểm tra order có tồn tại không
            if (!orderRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            // Xóa order khỏi database
            orderRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    // NOTE: Đã xóa demo/sample purchase generator. Server trả về empty list khi không có orders.

    /**
     * Xử lý webhook từ Stripe cho order events.
     * Stripe gửi webhook khi có sự kiện: payment success, failed, refund, etc.
     * @param payload JSON payload từ Stripe.
     * @param sigHeader Stripe signature để verify tính hợp lệ của webhook.
     * @return Message xác nhận xử lý webhook thành công.
     */
    @PostMapping("/webhook/stripe")
    public ResponseEntity<String> handleStripeWebhook(@RequestBody String payload,
                                                     @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            // Verify signature và xử lý webhook event
            orderService.handleStripeWebhook(payload, sigHeader);
            return ResponseEntity.ok("Webhook processed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Webhook error: " + e.getMessage());
        }
    }
}