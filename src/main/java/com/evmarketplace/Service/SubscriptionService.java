package com.evmarketplace.Service;

import com.evmarketplace.Pojo.Subscription;
import com.evmarketplace.Repository.SubscriptionRepository;
import org.springframework.stereotype.Service;

@Service
public class SubscriptionService {
    private final SubscriptionRepository repo;
    public SubscriptionService(SubscriptionRepository repo){ this.repo = repo; }
    public Subscription create(Subscription s){ s.setStatus("ACTIVE"); return repo.save(s); }
}
