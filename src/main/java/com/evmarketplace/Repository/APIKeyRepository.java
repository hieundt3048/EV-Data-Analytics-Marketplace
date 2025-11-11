package com.evmarketplace.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.evmarketplace.Pojo.APIKey;

@Repository
public interface APIKeyRepository extends JpaRepository<APIKey, UUID> {
    Optional<APIKey> findByKey(String key);
    List<APIKey> findByConsumerId(UUID consumerId);
}
