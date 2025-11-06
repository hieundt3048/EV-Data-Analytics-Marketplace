package com.evmarketplace.Service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

@Service
public class StripePaymentService {

    @Value("${stripe.secret-key:sk_test_demo}")
    private String secretKey;

    @Value("${app.payment.success-url:http://localhost:5173/payment/success}")
    private String successUrl;

    @Value("${app.payment.cancel-url:http://localhost:5173/payment/cancel}")
    private String cancelUrl;

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
    }

    public String createCheckoutSession(Long orderId, String productName, 
                                      Long amount, String currency) throws StripeException {
        SessionCreateParams params = SessionCreateParams.builder()
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl + "?session_id={CHECKOUT_SESSION_ID}&order_id=" + orderId)
                .setCancelUrl(cancelUrl + "?order_id=" + orderId)
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency(currency)
                                .setUnitAmount(amount)
                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName(productName)
                                        .build())
                                .build())
                        .build())
                .putMetadata("order_id", orderId.toString())
                .build();

        Session session = Session.create(params);
        return session.getId();
    }

    public String createSubscriptionSession(Long userId, String planId, 
                                          String productName, Long amount, String currency) throws StripeException {
        
        SessionCreateParams params = SessionCreateParams.builder()
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                .setSuccessUrl(successUrl + "?session_id={CHECKOUT_SESSION_ID}&user_id=" + userId + "&type=subscription")
                .setCancelUrl(cancelUrl + "?user_id=" + userId + "&type=subscription")
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPrice(planId)
                        .build())
                .putMetadata("user_id", userId.toString())
                .putMetadata("product_name", productName)
                .build();

        Session session = Session.create(params);
        return session.getId();
    }

    public Session retrieveSession(String sessionId) throws StripeException {
        return Session.retrieve(sessionId);
    }

    // Method đơn giản để tạo subscription - KHÔNG GÂY LỖI
    public String createSimpleSubscription(String customerEmail, String priceId) throws StripeException {
        Map<String, Object> customerParams = new HashMap<>();
        customerParams.put("email", customerEmail);
        customerParams.put("description", "Subscription customer");

        com.stripe.model.Customer customer = com.stripe.model.Customer.create(customerParams);

        Map<String, Object> subscriptionParams = new HashMap<>();
        subscriptionParams.put("customer", customer.getId());
        
        Map<String, Object> items = new HashMap<>();
        items.put("price", priceId);
        
        subscriptionParams.put("items", new Map[]{items});

        com.stripe.model.Subscription subscription = com.stripe.model.Subscription.create(subscriptionParams);
        return subscription.getId();
    }
}