package com.evmarketplace.Repository;

import com.evmarketplace.Pojo.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
}
