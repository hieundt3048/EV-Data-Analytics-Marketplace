// Mục đích: Giao diện repository cho lưu trữ ProviderProfile.
// Đáp ứng: Lớp truy xuất dữ liệu cho provider profile (ví dụ phương thức findByProviderName) theo class diagram.
package com.evmarketplace.Repository;

import java.util.UUID;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.evmarketplace.Pojo.ProviderProfile;

@Repository
public interface ProviderProfileRepository extends CrudRepository<ProviderProfile, UUID> {
    ProviderProfile findByProviderName(String name);
}
