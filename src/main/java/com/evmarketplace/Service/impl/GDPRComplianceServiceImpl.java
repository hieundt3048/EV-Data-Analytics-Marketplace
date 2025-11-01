package com.evmarketplace.Service.impl;

import com.evmarketplace.Repository.UserRepository;
import com.evmarketplace.Service.GDPRComplianceService;
import com.evmarketplace.Pojo.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

/**
 * Dịch vụ đảm bảo tuân thủ GDPR — xử lý "Quyền được quên" (Right to be forgotten).
 * Khi người dùng yêu cầu xóa tài khoản, hệ thống sẽ ẩn danh hóa dữ liệu PII thay vì xóa cứng.
 */
@Service
public class GDPRComplianceServiceImpl implements GDPRComplianceService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Ẩn danh hóa dữ liệu người dùng.
     * Thay thế dữ liệu nhạy cảm bằng giá trị giả/ẩn danh.
     */
    @Async
    @Override
    public void anonymizeUserData(UUID userId) {
        try {
            // Tìm người dùng theo ID (chuyển UUID -> Long nếu cần)
            Optional<User> optionalUser = userRepository.findById(userId.getMostSignificantBits() & Long.MAX_VALUE);

            if (optionalUser.isPresent()) {
                User user = optionalUser.get();

                // Ẩn danh hóa các trường nhạy cảm (PII)
                user.setName("Anonymous");
                user.setEmail("deleted_" + userId + "@gdpr.local");
                user.setOrganization(null);
                user.setPasswordHash("REMOVED_DUE_TO_GDPR");
                user.setProviderApproved(false);

                // Cập nhật lại vào DB
                userRepository.save(user);

                System.out.println("✅ Dữ liệu người dùng đã được ẩn danh hóa theo yêu cầu GDPR cho ID: " + userId);
            } else {
                System.out.println("⚠️ Không tìm thấy người dùng để ẩn danh hóa, ID: " + userId);
            }
        } catch (Exception e) {
            System.err.println("❌ Lỗi khi ẩn danh hóa dữ liệu người dùng: " + e.getMessage());
        }
    }
}
