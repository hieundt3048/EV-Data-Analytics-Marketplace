package com.evmarketplace.Service;

import com.evmarketplace.Pojo.Subscription;
import com.evmarketplace.Pojo.User;
import com.evmarketplace.Pojo.Dataset;
import com.evmarketplace.Repository.SubscriptionRepository;
import com.evmarketplace.Repository.UserRepository;
import com.evmarketplace.Repository.DatasetRepository;
import com.evmarketplace.dto.SubscriptionRequestDTO;
import com.evmarketplace.dto.CheckoutResponseDTO;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class SubscriptionService {
    
    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final DatasetRepository datasetRepository;
    private final StripePaymentService stripePaymentService;
    private final AccessControlService accessControlService;

    @Value("${stripe.webhook-secret:whsec_demo}")
    private String webhookSecret;

    public SubscriptionService(SubscriptionRepository subscriptionRepository,
                              UserRepository userRepository,
                              DatasetRepository datasetRepository,
                              StripePaymentService stripePaymentService,
                              AccessControlService accessControlService) {
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
        this.datasetRepository = datasetRepository;
        this.stripePaymentService = stripePaymentService;
        this.accessControlService = accessControlService;
    }

    @Transactional
    public CheckoutResponseDTO createSubscription(SubscriptionRequestDTO subscriptionRequest) {
        try {
            // Tìm user
            Optional<User> userOpt = userRepository.findById(Long.valueOf(subscriptionRequest.getConsumerId().toString()));
            if (userOpt.isEmpty()) {
                throw new RuntimeException("User not found with ID: " + subscriptionRequest.getConsumerId());
            }

            User user = userOpt.get();

            // Tạo subscription record
            Subscription subscription = new Subscription();
            subscription.setUser(user);
            subscription.setStartAt(LocalDateTime.now());
            subscription.setEndAt(LocalDateTime.now().plusMonths(1));
            subscription.setPrice(subscriptionRequest.getPrice());
            subscription.setStatus("PENDING");
            
            Subscription savedSubscription = subscriptionRepository.save(subscription);

            // Tạo Stripe checkout session
            String sessionId = stripePaymentService.createSubscriptionSession(
                user.getId(),
                subscriptionRequest.getStripePlanId(),
                subscriptionRequest.getProductName(),
                (long) (subscriptionRequest.getPrice() * 100),
                "usd"
            );

            String sessionUrl = "https://checkout.stripe.com/pay/" + sessionId;

            return new CheckoutResponseDTO(
                sessionId,
                sessionUrl,
                "pending", 
                "Subscription checkout created successfully",
                savedSubscription.getId()
            );

        } catch (StripeException e) {
            throw new RuntimeException("Stripe subscription error: " + e.getMessage(), e);
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid consumer ID format: " + subscriptionRequest.getConsumerId());
        } catch (Exception e) {
            throw new RuntimeException("Subscription creation error: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void activateSubscription(Long subscriptionId, String stripeSubscriptionId) {
        try {
            Subscription subscription = subscriptionRepository.findById(subscriptionId)
                    .orElseThrow(() -> new RuntimeException("Subscription not found with ID: " + subscriptionId));
            
            subscription.setStatus("ACTIVE");
            subscription.setEndAt(LocalDateTime.now().plusMonths(1));
            subscriptionRepository.save(subscription);

            // Cấp quyền truy cập cho user
            UUID userId = UUID.fromString(subscription.getUser().getId().toString());
            
            // TODO: Lấy datasetId từ subscription (cần thêm field datasetId vào Subscription entity)
            UUID datasetId = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
            
            accessControlService.grantSubscriptionAccess(userId, datasetId);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to activate subscription: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void handleStripeWebhook(String payload, String sigHeader) {
        try {
            // Verify webhook signature
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

            // Xử lý các event type khác nhau
            if ("checkout.session.completed".equals(event.getType())) {
                handleCheckoutSessionCompleted(event);
            } else if ("customer.subscription.created".equals(event.getType())) {
                handleSubscriptionCreated(event);
            } else if ("invoice.payment_succeeded".equals(event.getType())) {
                handleInvoicePaymentSucceeded(event);
            } else if ("customer.subscription.deleted".equals(event.getType())) {
                handleSubscriptionDeleted(event);
            }
            
        } catch (Exception e) {
            throw new RuntimeException("Stripe subscription webhook error: " + e.getMessage(), e);
        }
    }

    private void handleCheckoutSessionCompleted(Event event) {
        Session session = (Session) event.getDataObjectDeserializer().getObject().get();
        
        // Lấy subscription ID từ metadata
        String subscriptionIdStr = session.getMetadata().get("subscription_id");
        String stripeSubscriptionId = session.getSubscription();
        
        if (subscriptionIdStr != null && stripeSubscriptionId != null) {
            Long subscriptionId = Long.valueOf(subscriptionIdStr);
            activateSubscription(subscriptionId, stripeSubscriptionId);
        }
    }

    private void handleSubscriptionCreated(Event event) {
        // Sử dụng fully qualified name để tránh conflict
        com.stripe.model.Subscription stripeSubscription = 
            (com.stripe.model.Subscription) event.getDataObjectDeserializer().getObject().get();
        
        // TODO: Xử lý khi subscription được tạo trên Stripe
        System.out.println("Subscription created on Stripe: " + stripeSubscription.getId());
    }

    private void handleInvoicePaymentSucceeded(Event event) {
        // TODO: Xử lý khi thanh toán subscription thành công
        System.out.println("Subscription payment succeeded");
    }

    private void handleSubscriptionDeleted(Event event) {
        // Sử dụng fully qualified name để tránh conflict
        com.stripe.model.Subscription stripeSubscription = 
            (com.stripe.model.Subscription) event.getDataObjectDeserializer().getObject().get();
        
        // TODO: Xử lý khi subscription bị hủy trên Stripe
        System.out.println("Subscription cancelled on Stripe: " + stripeSubscription.getId());
    }

    // Method có sẵn - giữ nguyên
    public Subscription create(Subscription subscription) {
        subscription.setStatus("ACTIVE");
        return subscriptionRepository.save(subscription);
    }

    // Thêm method helper để lấy subscription theo ID
    public Optional<Subscription> getSubscriptionById(Long id) {
        return subscriptionRepository.findById(id);
    }

    // Thêm method để lấy subscriptions theo user
    public java.util.List<Subscription> getSubscriptionsByUser(User user) {
        return subscriptionRepository.findAll().stream()
                .filter(sub -> sub.getUser() != null && sub.getUser().getId().equals(user.getId()))
                .collect(java.util.stream.Collectors.toList());
    }
}