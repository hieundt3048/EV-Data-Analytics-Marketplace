package com.evmarketplace.Repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.evmarketplace.marketplace.UsagePolicy;

@Repository
public interface UsagePolicyRepository extends JpaRepository<UsagePolicy, UUID> {
    List<UsagePolicy> findByProductId(UUID productId);
}
