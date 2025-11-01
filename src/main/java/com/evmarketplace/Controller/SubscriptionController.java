package com.evmarketplace.Controller;

import com.evmarketplace.Pojo.Subscription;
import com.evmarketplace.Service.SubscriptionService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {
    private final SubscriptionService service;
    public SubscriptionController(SubscriptionService service){ this.service = service; }

    @PostMapping
    public Subscription create(@RequestBody Subscription sub){ return service.create(sub); }
}
