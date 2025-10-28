package com.evmarketplace.Repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.evmarketplace.Pojo.APIKey;

@Repository
public interface APIKeyRepository extends JpaRepository<APIKey, UUID> {
    APIKey findByKey(String key);
}
