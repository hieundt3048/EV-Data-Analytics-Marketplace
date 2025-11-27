package com.evmarketplace.aspect;

import com.evmarketplace.Repository.UserRepository;
import com.evmarketplace.Service.AccessControlService;
import com.evmarketplace.Pojo.User;
import com.evmarketplace.marketplace.AccessType;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

/**
 * Aspect để kiểm soát quyền truy cập vào dataset và dashboard.
 * Sử dụng AOP (Aspect-Oriented Programming) để tự động kiểm tra quyền trước khi thực thi các phương thức được đánh dấu.
 */
@Aspect
@Component
public class AccessControlAspect {

    private static final Logger logger = LoggerFactory.getLogger(AccessControlAspect.class);

    private final AccessControlService accessControlService;
    private final UserRepository userRepository;

    // Constructor injection: Spring tự động inject các dependencies
    public AccessControlAspect(AccessControlService accessControlService, UserRepository userRepository) {
        this.accessControlService = accessControlService;
        this.userRepository = userRepository;
    }

    /**
     * Kiểm tra quyền truy cập dataset trước khi cho phép download.
     * Được kích hoạt tự động khi gọi method có annotation @RequiresDatasetAccess.
     * @param datasetId ID của dataset cần kiểm tra quyền.
     * @throws SecurityException nếu người dùng chưa đăng nhập hoặc không có quyền truy cập.
     */
    @Before("@annotation(RequiresDatasetAccess) && args(datasetId, ..)")
    public void checkDatasetAccess(UUID datasetId) {
        // Lấy thông tin authentication từ SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("Authentication required");
        }

        // Lấy username (email) từ authentication
        String username = authentication.getName();
        UUID userId = getUserIdFromUsername(username);

        // Kiểm tra quyền DOWNLOAD dataset
        if (!accessControlService.hasAccess(userId, datasetId, AccessType.DOWNLOAD)) {
            throw new SecurityException("Access denied to dataset: " + datasetId);
        }
    }

    /**
     * Kiểm tra quyền truy cập dashboard/API của dataset.
     * Được kích hoạt tự động khi gọi method có annotation @RequiresDashboardAccess.
     * @param datasetId ID của dataset cần kiểm tra quyền.
     * @throws SecurityException nếu người dùng chưa đăng nhập hoặc không có quyền truy cập API.
     */
    @Before("@annotation(RequiresDashboardAccess) && args(datasetId, ..)")
    public void checkDashboardAccess(UUID datasetId) {
        // Lấy thông tin authentication từ SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("Authentication required");
        }

        // Lấy username (email) từ authentication
        String username = authentication.getName();
        UUID userId = getUserIdFromUsername(username);

        // Kiểm tra quyền API (truy cập dashboard)
        if (!accessControlService.hasAccess(userId, datasetId, AccessType.API)) {
            throw new SecurityException("Dashboard access denied to dataset: " + datasetId);
        }
    }

    /**
     * Chuyển đổi username (email) thành UUID của user.
     * Tìm user trong database và tạo UUID dựa trên user ID.
     * @param username Email hoặc tên đăng nhập của user.
     * @return UUID đại diện cho user.
     * @throws SecurityException nếu không thể resolve user ID.
     */
    private UUID getUserIdFromUsername(String username) {
        // Map the authentication principal (username/email) to a User entity and return a deterministic UUID based on the user id.
        try {
            // Tìm user theo email trong database
            Optional<User> u = userRepository.findByEmail(username);
            if (u.isPresent()) {
                // Tạo UUID từ user ID (deterministic - luôn cho cùng kết quả với cùng ID)
                Long id = u.get().getId();
                return UUID.nameUUIDFromBytes(String.valueOf(id).getBytes());
            } else {
                // Fallback: nếu không tìm thấy user, tạo UUID từ username
                logger.warn("No user found for principal '{}', falling back to name-based UUID", username);
                return UUID.nameUUIDFromBytes(username.getBytes());
            }
        } catch (Exception ex) {
            logger.error("Error mapping username to user id: {}", ex.getMessage());
            throw new SecurityException("Unable to resolve user id for principal");
        }
    }
}