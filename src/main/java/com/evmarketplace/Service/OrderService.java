package com.evmarketplace.Service;

import com.evmarketplace.Pojo.ProviderDataset;
import com.evmarketplace.Pojo.Order;
import com.evmarketplace.Pojo.Payment;
import com.evmarketplace.Pojo.User;
import com.evmarketplace.Repository.ProviderDatasetRepository;
import com.evmarketplace.Repository.OrderRepository;
import com.evmarketplace.Repository.PaymentRepository;
import com.evmarketplace.Repository.UserRepository;
import com.evmarketplace.dto.OrderRequestDTO;
import com.evmarketplace.dto.CheckoutResponseDTO;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProviderDatasetRepository providerDatasetRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final AccessControlService accessControlService;

    @Value("${stripe.webhook-secret:whsec_demo}")
    private String webhookSecret;

    public OrderService(OrderRepository orderRepository, 
                       ProviderDatasetRepository providerDatasetRepository,
                       PaymentRepository paymentRepository,
                       UserRepository userRepository,
                       AccessControlService accessControlService) {
        this.orderRepository = orderRepository;
        this.providerDatasetRepository = providerDatasetRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.accessControlService = accessControlService;
    }

    @Transactional
    public CheckoutResponseDTO createOrderAndCheckout(OrderRequestDTO orderRequest) {
        try {
            Optional<ProviderDataset> datasetOpt = providerDatasetRepository.findById(orderRequest.getDatasetId());
            
            if (datasetOpt.isEmpty()) {
                return new CheckoutResponseDTO(null, null, "error", "Dataset not found", null);
            }

            ProviderDataset dataset = datasetOpt.get();

            Order order = new Order();
            order.setDatasetId(dataset.getId());
            
            // Resolve buyer_id from authenticated user
            if (orderRequest.getConsumerId() != null) {
                order.setBuyerId(orderRequest.getConsumerId());
            } else {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                Long buyerId = null;
                
                if (auth != null && auth.getName() != null) {
                    String username = auth.getName();
                    
                    // Try to parse as Long first (if principal is user ID)
                    try {
                        buyerId = Long.valueOf(username);
                    } catch (NumberFormatException ex) {
                        // If not a number, treat as email and lookup user
                        Optional<User> userOpt = userRepository.findByEmail(username);
                        if (userOpt.isPresent()) {
                            buyerId = userOpt.get().getId();
                        }
                    }
                }
                
                // If still null, use demo fallback but log warning
                if (buyerId == null) {
                    System.err.println("WARNING: Could not resolve buyer_id from authentication, using demo id=1");
                    buyerId = 1L;
                }
                
                order.setBuyerId(buyerId);
            }
            
            // Set provider_id from dataset, use demo fallback if null
            Long providerId = dataset.getProviderId();
            if (providerId == null) {
                System.err.println("WARNING: Dataset " + dataset.getId() + " has no providerId, using demo id=1");
                providerId = 1L;
            }
            order.setProviderId(providerId);
            
            order.setAmount(dataset.getPrice() == null ? 0.0 : dataset.getPrice());
            order.setOrderDate(LocalDateTime.now());
            order.setStatus("PAID"); // Set to PAID immediately for demo
            
            Order savedOrder = orderRepository.save(order);

            // For demo: skip Stripe and return success immediately
            return new CheckoutResponseDTO(
                "demo_session_" + savedOrder.getId(), 
                "https://demo-checkout.local/success", 
                "success", 
                "Order created successfully (demo mode)", 
                savedOrder.getId()
            );

        } catch (Exception e) {
            throw new RuntimeException("Order creation error: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void processSuccessfulPayment(Long orderId, String stripePaymentId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        order.setStatus("PAID");
        orderRepository.save(order);

        Payment payment = new Payment();
        payment.setProvider("stripe");
        payment.setProviderPaymentId(stripePaymentId);
        payment.setAmount(order.getAmount());
        payment.setCurrency("usd");
        payment.setStatus("PAID");
        payment.setPaidAt(LocalDateTime.now());
        payment.setOrder(order);
        paymentRepository.save(payment);

        accessControlService.grantDatasetAccess(
            UUID.nameUUIDFromBytes(String.valueOf(order.getBuyerId()).getBytes()),
            UUID.nameUUIDFromBytes(String.valueOf(order.getDatasetId()).getBytes())
        );
    }

    public void handleStripeWebhook(String payload, String sigHeader) {
        try {
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

            if ("checkout.session.completed".equals(event.getType())) {
                Session session = (Session) event.getDataObjectDeserializer().getObject().get();
                String orderId = session.getMetadata().get("order_id");
                
                if (orderId != null) {
                    processSuccessfulPayment(Long.valueOf(orderId), session.getPaymentIntent());
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Stripe webhook error: " + e.getMessage(), e);
        }
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }
}