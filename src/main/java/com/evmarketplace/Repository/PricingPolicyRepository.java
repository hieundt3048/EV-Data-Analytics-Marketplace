package com.evmarketplace.Repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.evmarketplace.marketplace.PricingPolicy;

@Repository
public interface PricingPolicyRepository extends CrudRepository<PricingPolicy, UUID> {
    List<PricingPolicy> findByProductId(UUID productId);
}
