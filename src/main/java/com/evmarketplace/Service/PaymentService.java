package com.evmarketplace.Service;

import com.evmarketplace.Pojo.Order;
import com.evmarketplace.Pojo.Payment;
import com.evmarketplace.Repository.PaymentRepository;
import com.evmarketplace.Repository.DatasetRepository;
import com.evmarketplace.Repository.SubscriptionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PaymentService {
    @Value("${stripe.api.key:}")
    private String stripeKey;

    private final PaymentRepository paymentRepo;

    public PaymentService(PaymentRepository paymentRepo) {
        this.paymentRepo = paymentRepo;
    }

    public Payment createDemoPayment(Order order, Double amount) {
        Payment p = new Payment();
        p.setAmount(amount);
        p.setCurrency("usd");
        p.setProvider("STRIPE_DEMO");
        p.setProviderPaymentId("demo_" + System.currentTimeMillis());
        p.setStatus("PAID");
        p.setPaidAt(LocalDateTime.now());
        p.setOrder(order);
        return paymentRepo.save(p);
    }
}
