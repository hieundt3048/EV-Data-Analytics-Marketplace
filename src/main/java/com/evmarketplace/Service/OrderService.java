package com.evmarketplace.Service;

import com.evmarketplace.Pojo.Consumer;
import com.evmarketplace.Pojo.ProviderDataset;
import com.evmarketplace.Pojo.Order;
import com.evmarketplace.Pojo.Payment;
import com.evmarketplace.Pojo.User;
import com.evmarketplace.Repository.ConsumerRepository;
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
    private final ConsumerRepository consumerRepository;
    private final AccessControlService accessControlService;

    @Value("${stripe.webhook-secret:whsec_demo}")
    private String webhookSecret;

    public OrderService(OrderRepository orderRepository, 
                       ProviderDatasetRepository providerDatasetRepository,
                       PaymentRepository paymentRepository,
                       UserRepository userRepository,
                       ConsumerRepository consumerRepository,
                       AccessControlService accessControlService) {
        this.orderRepository = orderRepository;
        this.providerDatasetRepository = providerDatasetRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.consumerRepository = consumerRepository;
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

            // Get authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User user = null;
            
            if (auth != null && auth.getName() != null) {
                String username = auth.getName();
                
                // Try to parse as Long first (if principal is user ID)
                try {
                    Long userId = Long.valueOf(username);
                    user = userRepository.findById(userId).orElse(null);
                } catch (NumberFormatException ex) {
                    // If not a number, treat as email and lookup user
                    user = userRepository.findByEmail(username).orElse(null);
                }
            }
            
            if (user == null) {
                return new CheckoutResponseDTO(null, null, "error", "User not authenticated", null);
            }

            // Find or create Consumer record for this user
            Consumer consumer = consumerRepository.findByEmail(user.getEmail()).orElse(null);
            
            if (consumer == null) {
                // Create new Consumer from User
                consumer = new Consumer();
                consumer.setEmail(user.getEmail());
                consumer.setName(user.getName());
                consumer.setOrganization(user.getOrganization());
                consumer = consumerRepository.save(consumer);
                System.out.println("Created new Consumer for user: " + user.getEmail() + " with id: " + consumer.getId());
            }

            // CHECK IF ALREADY PURCHASED - Store IDs in final variables for lambda
            final Long finalConsumerId = consumer.getId();
            final Long finalDatasetId = orderRequest.getDatasetId();
            boolean alreadyPurchased = orderRepository.findAll().stream()
                .anyMatch(o -> o.getBuyerId().equals(finalConsumerId) 
                    && o.getDatasetId().equals(finalDatasetId)
                    && "PAID".equals(o.getStatus()));
            
            if (alreadyPurchased) {
                return new CheckoutResponseDTO(
                    null, 
                    null, 
                    "error", 
                    "You have already purchased this dataset", 
                    null
                );
            }

            Order order = new Order();
            order.setDatasetId(dataset.getId());
            order.setBuyerId(consumer.getId()); // Use Consumer ID, not User ID
            
            // Set provider_id from dataset, use demo fallback if null
            Long providerId = dataset.getProviderId();
            if (providerId == null) {
                System.err.println("WARNING: Dataset " + dataset.getId() + " has no providerId, using demo id=1");
                providerId = 1L;
            }
            order.setProviderId(providerId);
            
            order.setAmount(dataset.getPrice() == null ? 0.0 : dataset.getPrice());
            order.setOrderDate(LocalDateTime.now());
            order.setStatus("PENDING"); // Chờ admin duyệt
            
            Order savedOrder = orderRepository.save(order);

            // For demo: skip Stripe and return success immediately
            return new CheckoutResponseDTO(
                "demo_session_" + savedOrder.getId(), 
                "https://demo-checkout.local/success", 
                "success", 
                "Order created successfully, waiting for admin approval", 
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

    /**
     * Admin duyệt giao dịch - Phân chia doanh thu: 30% platform, 70% provider
     */
    @Transactional
    public Order approveTransaction(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        
        // Kiểm tra nếu đã duyệt rồi thì không duyệt lại
        if ("APPROVED".equals(order.getStatus())) {
            throw new RuntimeException("Order already approved");
        }
        
        // Tính toán revenue split: 30% platform, 70% provider
        Double totalAmount = order.getAmount();
        Double platformRevenue = totalAmount * 0.30; // 30% cho nền tảng
        Double providerRevenue = totalAmount * 0.70; // 70% cho provider
        
        // Cập nhật order
        order.setStatus("APPROVED");
        order.setPlatformRevenue(platformRevenue);
        order.setProviderRevenue(providerRevenue);
        order.setPayoutDate(LocalDateTime.now());
        
        return orderRepository.save(order);
    }
}