package com.evmarketplace.Repository;

import java.util.UUID;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.evmarketplace.Pojo.APIKey;

@Repository
public interface APIKeyRepository extends CrudRepository<APIKey, UUID> {
    APIKey findByKey(String key);
}
