package com.evmarketplace.config;

import com.evmarketplace.Pojo.Order;
import com.evmarketplace.Repository.OrderRepository;
import com.evmarketplace.Service.AccessControlService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * DataInitializer - Tự động tạo access grants cho các orders hiện có.
 * Implements CommandLineRunner để chạy 1 lần khi application khởi động.
 * Mục đích: Fix dữ liệu cũ - tạo quyền truy cập cho các đơn hàng đã thanh toán nhưng chưa có access grants.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final OrderRepository orderRepository;
    private final AccessControlService accessControlService;

    // Constructor injection: Spring tự động inject dependencies
    public DataInitializer(OrderRepository orderRepository, AccessControlService accessControlService) {
        this.orderRepository = orderRepository;
        this.accessControlService = accessControlService;
    }

    /**
     * Phương thức được gọi tự động khi application khởi động.
     * Quét tất cả orders có status PAID và tạo access grants nếu chưa có.
     * @param args Command line arguments (không sử dụng).
     */
    @Override
    public void run(String... args) throws Exception {
        logger.info("=== DataInitializer: Starting to fix access grants for existing orders ===");

        try {
            // Lấy tất cả orders có status PAID từ database
            List<Order> paidOrders = orderRepository.findAll().stream()
                    .filter(order -> "PAID".equals(order.getStatus()))
                    .toList();

            logger.info("Found {} paid orders to process", paidOrders.size());

            int successCount = 0;  // Đếm số orders đã tạo access grants thành công
            int skipCount = 0;     // Đếm số orders đã có access grants rồi

            for (Order order : paidOrders) {
                try {
                    // Convert buyer_id và dataset_id (Long) sang UUID để sử dụng trong access control
                    UUID consumerUUID = UUID.nameUUIDFromBytes(String.valueOf(order.getBuyerId()).getBytes());
                    UUID datasetUUID = UUID.nameUUIDFromBytes(String.valueOf(order.getDatasetId()).getBytes());

                    // Kiểm tra xem đã có access grant chưa
                    boolean hasApiAccess = accessControlService.hasDashboardAccess(consumerUUID, datasetUUID);
                    boolean hasDownloadAccess = accessControlService.hasRawDataAccess(consumerUUID, datasetUUID);

                    if (hasApiAccess && hasDownloadAccess) {
                        // Đã có đầy đủ quyền truy cập rồi, bỏ qua
                        skipCount++;
                        logger.debug("Order {} already has access grants, skipping", order.getId());
                        continue;
                    }

                    // Tạo access grants cho consumer (API + Download)
                    accessControlService.grantDatasetAccess(consumerUUID, datasetUUID);
                    successCount++;
                    
                    logger.info("Created access grants for Order {} (buyer: {}, dataset: {})", 
                            order.getId(), order.getBuyerId(), order.getDatasetId());

                } catch (Exception e) {
                    // Log lỗi nhưng tiếp tục xử lý orders khác
                    logger.error("Failed to create access grants for Order {}: {}", 
                            order.getId(), e.getMessage());
                }
            }

            // Log tổng kết kết quả
            logger.info("=== DataInitializer: Completed ===");
            logger.info("Total processed: {}, Created: {}, Skipped: {}", 
                    paidOrders.size(), successCount, skipCount);

        } catch (Exception e) {
            logger.error("DataInitializer failed: {}", e.getMessage(), e);
        }
    }
}
