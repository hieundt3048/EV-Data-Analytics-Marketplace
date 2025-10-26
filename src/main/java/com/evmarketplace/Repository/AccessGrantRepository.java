package com.evmarketplace.Repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.evmarketplace.marketplace.AccessGrant;

@Repository
public interface AccessGrantRepository extends CrudRepository<AccessGrant, UUID> {
    List<AccessGrant> findValidGrantsByConsumer(UUID consumerId);
}
