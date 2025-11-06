package com.evmarketplace.Controller;

import com.evmarketplace.Service.OrderService;
import com.evmarketplace.dto.CheckoutResponseDTO;
import com.evmarketplace.dto.OrderRequestDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderCheckoutController {

    private final OrderService orderService;

    public OrderCheckoutController(OrderService orderService) {
        this.orderService = orderService;
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