package com.evmarketplace.Controller;

import com.evmarketplace.Service.OrderService;
import com.evmarketplace.Service.PaymentService;
import com.evmarketplace.Pojo.Order;
import com.evmarketplace.Pojo.Payment;
import com.evmarketplace.dto.OrderRequestDTO;
import com.evmarketplace.dto.CheckoutResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {
    
    private final PaymentService paymentService; // Có sẵn
    private final OrderService orderService; // Service đã sửa

    public PaymentController(PaymentService paymentService, OrderService orderService) {
        this.paymentService = paymentService;
        this.orderService = orderService;
    }

    // Giữ lại API cũ cho tương thích
    @PostMapping("/checkout")
    public Payment checkout(@RequestBody Order order) {
        double amount = (order.getAmount() != null) ? order.getAmount() : 0.0;
        return paymentService.createDemoPayment(order, amount);
    }

    // Thêm API mới cho Stripe checkout
    @PostMapping("/stripe-checkout")
    public ResponseEntity<CheckoutResponseDTO> stripeCheckout(@Valid @RequestBody OrderRequestDTO orderRequest) {
        try {
            CheckoutResponseDTO response = orderService.createOrderAndCheckout(orderRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                new CheckoutResponseDTO(null, null, "error", e.getMessage(), null)
            );
        }
    }
}