package com.evmarketplace.Controller;

import com.evmarketplace.Pojo.Order;
import com.evmarketplace.Pojo.Payment;
import com.evmarketplace.Service.PaymentService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentService service;
    public PaymentController(PaymentService service){ this.service = service; }

    @PostMapping("/checkout")
    public Payment checkout(@RequestBody Order order){
        // For demo: create payment record and mark order paid
        return service.createDemoPayment(order, order.getAmount() == null ? 0.0 : order.getAmount());
    }
}
