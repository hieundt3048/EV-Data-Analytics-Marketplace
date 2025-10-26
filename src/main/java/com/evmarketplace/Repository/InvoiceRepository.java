package com.evmarketplace.Repository;

import java.util.UUID;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.evmarketplace.billing.Invoice;

@Repository
public interface InvoiceRepository extends CrudRepository<Invoice, UUID> {
    Invoice findByTransactionId(UUID transactionId);
}
