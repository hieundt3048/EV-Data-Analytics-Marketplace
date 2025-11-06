package com.evmarketplace.Controller;

import com.evmarketplace.Service.SubscriptionService;
import com.evmarketplace.dto.CheckoutResponseDTO;
import com.evmarketplace.dto.SubscriptionRequestDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController 
@RequestMapping("/api/subscriptions")
@CrossOrigin(origins = "http://localhost:5173")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @PostMapping
    public ResponseEntity<CheckoutResponseDTO> createSubscription(
            @Valid @RequestBody SubscriptionRequestDTO subscriptionRequest) {
        try {
            CheckoutResponseDTO response = subscriptionService.createSubscription(subscriptionRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                new CheckoutResponseDTO(null, null, "error", e.getMessage(), null)
            );
        }
    }

    @PostMapping("/webhook/stripe")
    public ResponseEntity<String> handleStripeSubscriptionWebhook(@RequestBody String payload, 
                                                                 @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            subscriptionService.handleStripeWebhook(payload, sigHeader);
            return ResponseEntity.ok("Subscription webhook processed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Webhook error: " + e.getMessage());
        }
    }
}