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

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderCheckoutController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final DatasetRepository datasetRepository;
    private final ProviderDatasetRepository providerDatasetRepository;

    public OrderCheckoutController(OrderService orderService, OrderRepository orderRepository, 
                                   DatasetRepository datasetRepository, ProviderDatasetRepository providerDatasetRepository) {
        this.orderService = orderService;
        this.orderRepository = orderRepository;
        this.datasetRepository = datasetRepository;
        this.providerDatasetRepository = providerDatasetRepository;
    }

    @PostMapping("/checkout")
    public ResponseEntity<CheckoutResponseDTO> checkout(@Valid @RequestBody OrderRequestDTO orderRequest) {
        try {
            CheckoutResponseDTO response = orderService.createOrderAndCheckout(orderRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                new CheckoutResponseDTO(null, null, "error", e.getMessage(), null)
            );
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<OrderHistoryDTO>> getPurchaseHistory() {
        try {
            // Get current authenticated user (có thể dùng để filter theo user sau này)
            // Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            // For now, return all orders (you can filter by user later)
            List<Order> orders = orderRepository.findAll();

            // If no orders exist, return sample data for testing
            if (orders.isEmpty()) {
                List<OrderHistoryDTO> sampleOrders = createSamplePurchaseHistory();
                return ResponseEntity.ok(sampleOrders);
            }

            // Convert to DTO with dataset information
            List<OrderHistoryDTO> orderHistory = orders.stream().map(order -> {
                String datasetTitle = "Unknown Dataset";
                String category = null;
                String pricingType = null;
                
                try {
                    // Thử lấy từ ProviderDataset trước (vì Order có thể trỏ đến ProviderDataset)
                    ProviderDataset providerDataset = providerDatasetRepository.findById(order.getDatasetId()).orElse(null);
                    if (providerDataset != null) {
                        datasetTitle = providerDataset.getName();
                        category = providerDataset.getCategory();
                        pricingType = providerDataset.getPricingType();
                    } else {
                        // Nếu không tìm thấy, thử lấy từ Dataset
                        Dataset dataset = datasetRepository.findById(order.getDatasetId()).orElse(null);
                        if (dataset != null) {
                            datasetTitle = dataset.getTitle();
                            // Dataset có thể có category qua relationship
                            if (dataset.getCategory() != null) {
                                category = dataset.getCategory().getName();
                            }
                        }
                    }
                } catch (Exception e) {
                    // Ignore and use default values
                }

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

    private List<OrderHistoryDTO> createSamplePurchaseHistory() {
        List<OrderHistoryDTO> sampleOrders = new java.util.ArrayList<>();

        // Sample order 1
        sampleOrders.add(new OrderHistoryDTO(
            1L,
            101L,
            "Battery Performance Dataset",
            49.99,
            java.time.LocalDateTime.now().minusDays(7),
            "PAID",
            "battery_health",
            "per_request"
        ));

        // Sample order 2
        sampleOrders.add(new OrderHistoryDTO(
            2L,
            102L,
            "EV Charging Patterns Data",
            79.99,
            java.time.LocalDateTime.now().minusDays(14),
            "PAID",
            "charging_behavior",
            "subscription"
        ));

        // Sample order 3
        sampleOrders.add(new OrderHistoryDTO(
            3L,
            103L,
            "Vehicle Telematics Dataset",
            99.99,
            java.time.LocalDateTime.now().minusDays(21),
            "PAID",
            "route_optimization",
            "per_request"
        ));

        // Sample order 4
        sampleOrders.add(new OrderHistoryDTO(
            4L,
            104L,
            "Energy Consumption Analytics",
            59.99,
            java.time.LocalDateTime.now().minusDays(30),
            "PAID",
            "energy_consumption",
            "subscription"
        ));

        return sampleOrders;
    }

    @PostMapping("/webhook/stripe")
    public ResponseEntity<String> handleStripeWebhook(@RequestBody String payload,
                                                     @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            orderService.handleStripeWebhook(payload, sigHeader);
            return ResponseEntity.ok("Webhook processed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Webhook error: " + e.getMessage());
        }
    }
}