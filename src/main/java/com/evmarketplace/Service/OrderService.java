package com.evmarketplace.Service;

import com.evmarketplace.Pojo.Dataset;
import com.evmarketplace.Pojo.Order;
import com.evmarketplace.Pojo.Payment;
import com.evmarketplace.Repository.DatasetRepository;
import com.evmarketplace.Repository.OrderRepository;
import com.evmarketplace.Repository.PaymentRepository;
import com.evmarketplace.dto.OrderRequestDTO;
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
public class OrderService {

    private final OrderRepository orderRepository;
    private final DatasetRepository datasetRepository;
    private final PaymentRepository paymentRepository;
    private final StripePaymentService stripePaymentService;
    private final AccessControlService accessControlService;

    @Value("${stripe.webhook-secret:whsec_demo}")
    private String webhookSecret;

    public OrderService(OrderRepository orderRepository, 
                       DatasetRepository datasetRepository,
                       PaymentRepository paymentRepository, 
                       StripePaymentService stripePaymentService,
                       AccessControlService accessControlService) {
        this.orderRepository = orderRepository;
        this.datasetRepository = datasetRepository;
        this.paymentRepository = paymentRepository;
        this.stripePaymentService = stripePaymentService;
        this.accessControlService = accessControlService;
    }

    @Transactional
    public CheckoutResponseDTO createOrderAndCheckout(OrderRequestDTO orderRequest) {
        try {
            Optional<Dataset> datasetOpt = datasetRepository.findById(
                Long.valueOf(orderRequest.getDatasetId().toString()));
            
            if (datasetOpt.isEmpty()) {
                return new CheckoutResponseDTO(null, null, "error", "Dataset not found", null);
            }

            Dataset dataset = datasetOpt.get();

            Order order = new Order();
            order.setDatasetId(dataset.getId());
            order.setBuyerId(Long.valueOf(orderRequest.getConsumerId().toString()));
            order.setProviderId(1L);
            order.setAmount(dataset.getPrice());
            order.setOrderDate(LocalDateTime.now());
            order.setStatus("PENDING");
            
            Order savedOrder = orderRepository.save(order);

            Long amountInCents = (long) (dataset.getPrice() * 100);
            String sessionId = stripePaymentService.createCheckoutSession(
                savedOrder.getId(),
                dataset.getTitle(),
                amountInCents,
                "usd"
            );

            String sessionUrl = "https://checkout.stripe.com/pay/" + sessionId;

            return new CheckoutResponseDTO(
                sessionId, 
                sessionUrl, 
                "pending", 
                "Checkout session created successfully", 
                savedOrder.getId()
            );

        } catch (StripeException e) {
            throw new RuntimeException("Stripe payment error: " + e.getMessage(), e);
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
            UUID.fromString(order.getBuyerId().toString()),
            UUID.fromString(order.getDatasetId().toString())
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