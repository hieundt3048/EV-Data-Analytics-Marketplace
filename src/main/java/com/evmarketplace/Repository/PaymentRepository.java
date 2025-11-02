package com.evmarketplace.Repository;

import com.evmarketplace.Pojo.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
}
