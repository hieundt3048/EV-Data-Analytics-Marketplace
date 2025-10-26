// Mục đích: Repository cho ConsumerProfile.
// Đáp ứng: Truy xuất dữ liệu consumer theo userId hoặc các truy vấn đơn giản khác.
package com.evmarketplace.Repository;

import java.util.UUID;
import com.evmarketplace.Pojo.ConsumerProfile;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConsumerProfileRepository extends CrudRepository<ConsumerProfile, UUID> {
    ConsumerProfile findByUserId(UUID userId);
}
