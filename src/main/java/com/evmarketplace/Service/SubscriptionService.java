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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class SubscriptionService {
    private static final Logger logger = LoggerFactory.getLogger(SubscriptionService.class);
    
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
    public CheckoutResponseDTO createSubscription(SubscriptionRequestDTO subscriptionRequest, javax.servlet.http.HttpServletRequest httpRequest) {
        try {
            logger.info("Creating subscription - Request: {}", subscriptionRequest);
            
            // Thử lấy email từ request (được JwtFilter đặt vào request nếu user đã xác thực)
            String email = com.evmarketplace.auth.SecurityUtils.getEmailFromRequest(httpRequest);
            logger.info("Email from request: {}", email);
            
            // Also try to get from SecurityContext
            if (email == null) {
                org.springframework.security.core.Authentication auth = 
                    org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.getPrincipal() instanceof String) {
                    email = (String) auth.getPrincipal();
                    logger.info("Email from SecurityContext: {}", email);
                }
            }
            
            Optional<User> userOpt = Optional.empty();
            if (email != null) {
                userOpt = userRepository.findByEmail(email);
                logger.info("User found by email: {}", userOpt.isPresent());
            }

            // Nếu không có user từ principal, fallback sang consumerId từ payload (nếu được gửi)
            if (userOpt.isEmpty() && subscriptionRequest.getConsumerId() != null) {
                try {
                    // Một số client có thể gửi ID numeric trong consumerId (legacy) — thử parse
                    long id = Long.parseLong(subscriptionRequest.getConsumerId().toString());
                    userOpt = userRepository.findById(id);
                } catch (NumberFormatException ignored) {
                    // Không thể parse — tiếp tục và báo lỗi bên dưới nếu rỗng
                }
            }

            if (userOpt.isEmpty()) {
                throw new RuntimeException("User not found or unauthenticated; please login before creating a subscription");
            }

            User user = userOpt.get();

            // Tạo subscription record
            Subscription subscription = new Subscription();
            subscription.setUser(user);
            // Gán dataset cho subscription
            if (subscriptionRequest.getDatasetId() != null) {
                datasetRepository.findById(subscriptionRequest.getDatasetId()).ifPresent(subscription::setDataset);
            }
            subscription.setStartAt(LocalDateTime.now());
            subscription.setEndAt(LocalDateTime.now().plusMonths(1));
            subscription.setPrice(subscriptionRequest.getPrice());
            subscription.setStatus("ACTIVE"); // Set ACTIVE directly for development
            
            Subscription savedSubscription = subscriptionRepository.save(subscription);

            // Skip Stripe for development - TODO: Enable Stripe with real API keys
            // String sessionId = stripePaymentService.createSubscriptionSession(...);
            
            logger.info("Subscription created successfully (Stripe bypassed for development): {}", savedSubscription.getId());

            return new CheckoutResponseDTO(
                null, // No Stripe session ID
                null, // No checkout URL
                "success", 
                "Subscription activated successfully (Development mode)",
                savedSubscription.getId()
            );

        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid consumer ID format: " + subscriptionRequest.getConsumerId());
        } catch (Exception e) {
            throw new RuntimeException("Subscription creation error: " + e.getMessage(), e);
        }
    }

    @Transactional
    public java.util.List<Subscription> getUserSubscriptions() {
        try {
            // Get authenticated user email from SecurityContext
            org.springframework.security.core.Authentication auth = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            
            if (auth == null || auth.getPrincipal() == null) {
                logger.warn("No authenticated user found");
                return java.util.Collections.emptyList();
            }
            
            String email = auth.getPrincipal().toString();
            logger.info("Fetching subscriptions for user: {}", email);
            
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                logger.warn("User not found for email: {}", email);
                return java.util.Collections.emptyList();
            }
            
            User user = userOpt.get();
            return subscriptionRepository.findByUserId(user.getId());
        } catch (Exception e) {
            logger.error("Error fetching user subscriptions", e);
            return java.util.Collections.emptyList();
        }
    }

    @Transactional
    public void cancelSubscription(Long subscriptionId) {
        try {
            Subscription subscription = subscriptionRepository.findById(subscriptionId)
                    .orElseThrow(() -> new RuntimeException("Subscription not found with ID: " + subscriptionId));
            
            // Update status to CANCELLED
            subscription.setStatus("CANCELLED");
            subscription.setEndAt(LocalDateTime.now()); // End subscription immediately
            subscriptionRepository.save(subscription);
            
            logger.info("Subscription cancelled: {}", subscriptionId);
            
            // TODO: When Stripe is enabled, call Stripe API to cancel subscription
            // stripe.subscriptions.cancel(subscription.getStripeSubscriptionId());
        } catch (Exception e) {
            logger.error("Error cancelling subscription: {}", subscriptionId, e);
            throw new RuntimeException("Failed to cancel subscription: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteSubscription(Long subscriptionId) {
        try {
            Subscription subscription = subscriptionRepository.findById(subscriptionId)
                    .orElseThrow(() -> new RuntimeException("Subscription not found with ID: " + subscriptionId));
            
            // Only allow deletion of CANCELLED subscriptions
            if (!"CANCELLED".equals(subscription.getStatus())) {
                throw new RuntimeException("Only cancelled subscriptions can be deleted. Please cancel the subscription first.");
            }
            
            subscriptionRepository.delete(subscription);
            logger.info("Subscription deleted: {}", subscriptionId);
        } catch (Exception e) {
            logger.error("Error deleting subscription: {}", subscriptionId, e);
            throw new RuntimeException("Failed to delete subscription: " + e.getMessage());
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
            UUID userId = UUID.nameUUIDFromBytes(String.valueOf(subscription.getUser().getId()).getBytes());

            // Lấy datasetId từ subscription entity (nếu có). Nếu không có, trả lỗi rõ ràng (không dùng fallback cứng).
            Long dsId = subscription.getDataset() != null ? subscription.getDataset().getId() : null;
            if (dsId == null) {
                throw new RuntimeException("Subscription " + subscriptionId + " is not associated with a dataset; cannot grant access");
            }

            UUID datasetId = UUID.nameUUIDFromBytes(String.valueOf(dsId).getBytes());
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
        logger.info("Subscription created on Stripe: {}", stripeSubscription.getId());
    }

    private void handleInvoicePaymentSucceeded(Event event) {
        // TODO: Xử lý khi thanh toán subscription thành công
        logger.info("Subscription payment succeeded");
    }

    private void handleSubscriptionDeleted(Event event) {
        // Sử dụng fully qualified name để tránh conflict
        com.stripe.model.Subscription stripeSubscription = 
            (com.stripe.model.Subscription) event.getDataObjectDeserializer().getObject().get();
        
        // TODO: Xử lý khi subscription bị hủy trên Stripe
        logger.info("Subscription cancelled on Stripe: {}", stripeSubscription.getId());
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