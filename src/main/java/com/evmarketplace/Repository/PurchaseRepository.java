// Mục đích: Giao diện repository cho lưu trữ và truy vấn Purchase.
// Đáp ứng: Lưu trữ lịch sử mua hàng và truy vấn theo trạng thái/consumer cho module marketplace và billing.
package com.evmarketplace.Repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.evmarketplace.marketplace.Purchase;
import com.evmarketplace.marketplace.PurchaseStatus;

@Repository
public interface PurchaseRepository extends CrudRepository<Purchase, UUID> {
    List<Purchase> findByConsumerId(UUID consumerId);
    List<Purchase> findByStatus(PurchaseStatus status);
}
