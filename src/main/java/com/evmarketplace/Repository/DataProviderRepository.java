package com.evmarketplace.Repository;

import com.evmarketplace.Pojo.User;
import com.evmarketplace.data.DataProvider;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DataProviderRepository extends JpaRepository<DataProvider, UUID> {
    Optional<DataProvider> findByUser(User user);
    Optional<DataProvider> findByProviderName(String providerName);
}
