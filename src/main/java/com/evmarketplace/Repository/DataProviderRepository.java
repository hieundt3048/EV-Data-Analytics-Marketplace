package com.evmarketplace.Repository;

// Mục đích: Repository cho DataProvider.
// Đáp ứng: Cho phép Spring Data JPA truy vấn/persist thực thể DataProvider.

import com.evmarketplace.providers.DataProvider;
import com.evmarketplace.Pojo.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DataProviderRepository extends JpaRepository<DataProvider, UUID> {
    Optional<DataProvider> findByUser(User user);
    Optional<DataProvider> findByProviderName(String providerName);
}
