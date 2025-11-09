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
 * DataInitializer - Tự động tạo access grants cho các orders hiện có
 * Chạy 1 lần khi application khởi động để fix data cũ
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final OrderRepository orderRepository;
    private final AccessControlService accessControlService;

    public DataInitializer(OrderRepository orderRepository, AccessControlService accessControlService) {
        this.orderRepository = orderRepository;
        this.accessControlService = accessControlService;
    }

    @Override
    public void run(String... args) throws Exception {
        logger.info("=== DataInitializer: Starting to fix access grants for existing orders ===");

        try {
            // Lấy tất cả orders có status PAID
            List<Order> paidOrders = orderRepository.findAll().stream()
                    .filter(order -> "PAID".equals(order.getStatus()))
                    .toList();

            logger.info("Found {} paid orders to process", paidOrders.size());

            int successCount = 0;
            int skipCount = 0;

            for (Order order : paidOrders) {
                try {
                    // Convert buyer_id và dataset_id sang UUID
                    UUID consumerUUID = UUID.nameUUIDFromBytes(String.valueOf(order.getBuyerId()).getBytes());
                    UUID datasetUUID = UUID.nameUUIDFromBytes(String.valueOf(order.getDatasetId()).getBytes());

                    // Kiểm tra xem đã có access grant chưa
                    boolean hasApiAccess = accessControlService.hasDashboardAccess(consumerUUID, datasetUUID);
                    boolean hasDownloadAccess = accessControlService.hasRawDataAccess(consumerUUID, datasetUUID);

                    if (hasApiAccess && hasDownloadAccess) {
                        // Đã có access grant rồi, skip
                        skipCount++;
                        logger.debug("Order {} already has access grants, skipping", order.getId());
                        continue;
                    }

                    // Tạo access grants
                    accessControlService.grantDatasetAccess(consumerUUID, datasetUUID);
                    successCount++;
                    
                    logger.info("Created access grants for Order {} (buyer: {}, dataset: {})", 
                            order.getId(), order.getBuyerId(), order.getDatasetId());

                } catch (Exception e) {
                    logger.error("Failed to create access grants for Order {}: {}", 
                            order.getId(), e.getMessage());
                }
            }

            logger.info("=== DataInitializer: Completed ===");
            logger.info("Total processed: {}, Created: {}, Skipped: {}", 
                    paidOrders.size(), successCount, skipCount);

        } catch (Exception e) {
            logger.error("DataInitializer failed: {}", e.getMessage(), e);
        }
    }
}
