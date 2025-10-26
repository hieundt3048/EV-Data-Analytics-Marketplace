package com.evmarketplace.Repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.evmarketplace.billing.Transaction;

@Repository
public interface TransactionRepository extends CrudRepository<Transaction, UUID> {
    List<Transaction> findByPurchaseId(UUID purchaseId);
    List<Transaction> findByTimestampBetween(java.util.Date from, java.util.Date to);
}
