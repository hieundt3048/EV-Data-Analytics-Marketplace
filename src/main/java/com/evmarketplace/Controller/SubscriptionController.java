package com.evmarketplace.Controller;

import com.evmarketplace.Service.SubscriptionService;
import com.evmarketplace.dto.CheckoutResponseDTO;
import com.evmarketplace.dto.SubscriptionRequestDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.servlet.http.HttpServletRequest;

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
            @Valid @RequestBody SubscriptionRequestDTO subscriptionRequest,
            HttpServletRequest request) {
        try {
            CheckoutResponseDTO response = subscriptionService.createSubscription(subscriptionRequest, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                new CheckoutResponseDTO(null, null, "error", e.getMessage(), null)
            );
        }
    }

    @GetMapping
    public ResponseEntity<java.util.List<com.evmarketplace.Pojo.Subscription>> getUserSubscriptions() {
        try {
            // For now, return sample subscriptions for testing
            java.util.List<com.evmarketplace.Pojo.Subscription> sampleSubscriptions = createSampleSubscriptions();
            return ResponseEntity.ok(sampleSubscriptions);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

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