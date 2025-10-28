package com.evmarketplace.Repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.evmarketplace.marketplace.AccessGrant;

@Repository
public interface AccessGrantRepository extends JpaRepository<AccessGrant, UUID> {
    List<AccessGrant> findByConsumerId(UUID consumerId);
}
