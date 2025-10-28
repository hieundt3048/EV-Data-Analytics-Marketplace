// Mục đích: Giao diện repository cho lưu trữ Subscription.
// Đáp ứng: Thực hiện các truy vấn lưu trữ về subscription (ví dụ findByConsumerId) theo class diagram.
package com.evmarketplace.Repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.evmarketplace.marketplace.Subscription;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
    List<Subscription> findByConsumerId(UUID consumerId);
}
