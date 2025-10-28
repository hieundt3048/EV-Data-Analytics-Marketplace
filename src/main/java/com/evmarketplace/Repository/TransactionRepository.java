package com.evmarketplace.Repository;

import java.util.Date;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.evmarketplace.billing.Transaction;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    List<Transaction> findByPurchaseId(UUID purchaseId);
    List<Transaction> findByTimestampBetween(Date from, Date to);
}
