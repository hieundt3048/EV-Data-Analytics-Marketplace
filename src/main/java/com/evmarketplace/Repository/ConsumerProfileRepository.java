// Mục đích: Repository cho ConsumerProfile.
// Đáp ứng: Truy xuất dữ liệu consumer theo userId hoặc các truy vấn đơn giản khác.
package com.evmarketplace.Repository;

import com.evmarketplace.Pojo.ConsumerProfile;
import com.evmarketplace.Pojo.User; // Reintroducing the import for User
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConsumerProfileRepository extends JpaRepository<ConsumerProfile, java.util.UUID> {
    ConsumerProfile findByUser(User user); // Using simple name User
}
