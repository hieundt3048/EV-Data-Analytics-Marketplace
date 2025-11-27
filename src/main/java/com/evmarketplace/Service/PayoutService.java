package com.evmarketplace.Service;

import com.evmarketplace.Pojo.Order;
import com.evmarketplace.Repository.OrderRepository;
import com.evmarketplace.Repository.DataProviderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service xử lý logic nghiệp vụ liên quan đến thanh toán và doanh thu.
 * Quản lý việc tính toán hoa hồng, chia sẻ doanh thu giữa platform và provider.
 */
@Service
public class PayoutService {

    // Tỷ lệ hoa hồng của platform (30%)
    private static final double PLATFORM_COMMISSION_RATE = 0.30;

    private final OrderRepository orderRepository;

    public PayoutService(OrderRepository orderRepository, DataProviderRepository dataProviderRepository) {
        this.orderRepository = orderRepository;
    }

    /**
     * Tính toán chi tiết phân chia doanh thu cho một đơn hàng.
     * @param order Đơn hàng cần tính toán.
     * @return PayoutBreakdown chứa thông tin: tổng tiền, hoa hồng platform, tiền provider nhận được.
     */
    public PayoutBreakdown calculatePayoutBreakdown(Order order) {
        BigDecimal totalAmount = BigDecimal.valueOf(order.getAmount());
        BigDecimal platformCommission = totalAmount.multiply(BigDecimal.valueOf(PLATFORM_COMMISSION_RATE)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal providerPayout = totalAmount.subtract(platformCommission).setScale(2, RoundingMode.HALF_UP);
        return PayoutBreakdown.builder().orderId(order.getId()).totalAmount(totalAmount).platformCommission(platformCommission).providerPayout(providerPayout).commissionRate(PLATFORM_COMMISSION_RATE).orderDate(order.getOrderDate()).build();
    }

    /**
     * Lấy danh sách các khoản thanh toán đang chờ xử lý của một provider.
     * @param providerId ID của provider.
     * @return Danh sách các đơn hàng đã được APPROVED nhưng chưa chuyển tiền cho provider.
     */
    public List<Map<String, Object>> getPendingPayouts(Long providerId) {
        // Lay orders da APPROVED cua provider (da duyet nhung chua chuyen tien)
        List<Order> approvedOrders = orderRepository.findByProviderIdAndStatus(providerId, "APPROVED");
        
        return approvedOrders.stream().map(order -> {
            Map<String, Object> payout = new HashMap<>();
            payout.put("orderId", order.getId());
            payout.put("orderDate", order.getOrderDate());
            payout.put("buyerId", order.getBuyerId());
            payout.put("datasetId", order.getDatasetId());
            payout.put("totalAmount", order.getAmount());
            payout.put("platformCommission", order.getPlatformRevenue());
            payout.put("providerPayout", order.getProviderRevenue());
            payout.put("status", order.getStatus());
            return payout;
        }).collect(Collectors.toList());
    }

    /**
     * Lấy tổng quan doanh thu của một provider.
     * Tính tổng doanh thu, hoa hồng, tiền ròng, và số lượng đơn hàng pending/completed.
     * @param providerId ID của provider.
     * @return Map chứa thông tin tổng hợp: totalRevenue, totalCommission, totalNetPayout, pendingPayoutsCount, totalOrdersCount.
     */
    public Map<String, Object> getProviderRevenueSummary(Long providerId) {
        List<Order> allOrders = orderRepository.findByProviderId(providerId);
        // Chỉ tính orders da duoc APPROVED (admin da duyet)
        List<Order> approvedOrders = allOrders.stream()
            .filter(o -> "APPROVED".equals(o.getStatus()))
            .collect(Collectors.toList());
        
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalCommission = BigDecimal.ZERO;
        BigDecimal totalNetPayout = BigDecimal.ZERO;
        
        for (Order order : approvedOrders) {
            // Dùng providerRevenue và platformRevenue đã được tính khi admin approve
            Double amount = order.getAmount() != null ? order.getAmount() : 0.0;
            Double providerRev = order.getProviderRevenue() != null ? order.getProviderRevenue() : 0.0;
            Double platformRev = order.getPlatformRevenue() != null ? order.getPlatformRevenue() : 0.0;
            
            totalRevenue = totalRevenue.add(BigDecimal.valueOf(amount));
            totalCommission = totalCommission.add(BigDecimal.valueOf(platformRev));
            totalNetPayout = totalNetPayout.add(BigDecimal.valueOf(providerRev));
        }
        
        // Đếm orders PENDING (chưa duyệt)
        int pendingPayoutsCount = (int) allOrders.stream()
            .filter(o -> "PENDING".equals(o.getStatus()))
            .count();
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("providerId", providerId);
        summary.put("providerName", "Provider #" + providerId);
        summary.put("providerEmail", "N/A");
        summary.put("totalRevenue", totalRevenue);
        summary.put("totalCommission", totalCommission);
        summary.put("totalNetPayout", totalNetPayout);
        summary.put("pendingPayoutsCount", pendingPayoutsCount);
        summary.put("totalOrdersCount", approvedOrders.size());
        return summary;
    }

    /**
     * Lấy thống kê doanh thu của toàn platform trong khoảng thời gian.
     * @param startDate Ngày bắt đầu (có thể null để lấy tất cả).
     * @param endDate Ngày kết thúc (có thể null để lấy tất cả).
     * @return Map chứa: totalRevenue, platformCommissions, providerPayouts, totalTransactions, completedTransactions, pendingPayouts.
     */
    public Map<String, Object> getPlatformRevenueStats(LocalDateTime startDate, LocalDateTime endDate) {
        // Nếu không có filter date thì lấy tất cả orders
        List<Order> orders;
        if (startDate != null && endDate != null) {
            orders = orderRepository.findByOrderDateBetween(startDate, endDate);
        } else {
            orders = orderRepository.findAll();
        }
        
        // Chỉ tính orders đã APPROVED, COMPLETED, PAYOUT_COMPLETED, PAID
        List<Order> completedOrders = orders.stream()
            .filter(o -> {
                String status = o.getStatus();
                if (status == null) return false;
                String statusUpper = status.toUpperCase();
                return statusUpper.equals("APPROVED") || 
                       statusUpper.equals("COMPLETED") || 
                       statusUpper.equals("PAYOUT_COMPLETED") ||
                       statusUpper.equals("PAID");
            })
            .collect(Collectors.toList());
        
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalCommission = BigDecimal.ZERO;
        BigDecimal totalProviderPayouts = BigDecimal.ZERO;
        
        for (Order order : completedOrders) {
            Double amount = order.getAmount() != null ? order.getAmount() : 0.0;
            Double providerRev = order.getProviderRevenue() != null ? order.getProviderRevenue() : 0.0;
            Double platformRev = order.getPlatformRevenue() != null ? order.getPlatformRevenue() : 0.0;
            
            totalRevenue = totalRevenue.add(BigDecimal.valueOf(amount));
            totalCommission = totalCommission.add(BigDecimal.valueOf(platformRev));
            totalProviderPayouts = totalProviderPayouts.add(BigDecimal.valueOf(providerRev));
        }
        
        // Đếm pending payouts
        long pendingPayouts = orders.stream()
            .filter(o -> "PENDING".equalsIgnoreCase(o.getStatus()))
            .count();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("startDate", startDate);
        stats.put("endDate", endDate);
        stats.put("totalRevenue", totalRevenue);
        stats.put("platformCommissions", totalCommission);
        stats.put("providerPayouts", totalProviderPayouts);
        stats.put("totalTransactions", orders.size());
        stats.put("completedTransactions", completedOrders.size());
        stats.put("pendingPayouts", pendingPayouts);
        stats.put("commissionRate", "30%");
        return stats;
    }

    /**
     * Lấy danh sách tổng hợp thanh toán của tất cả providers.
     * @return Danh sách Map chứa thông tin doanh thu của từng provider.
     */
    public List<Map<String, Object>> getAllProviderPayouts() {
        // lấy tất cả unique provider IDs từ orders
        List<Long> providerIds = orderRepository.findAll().stream()
            .map(Order::getProviderId)
            .filter(Objects::nonNull)
            .distinct()
            .collect(Collectors.toList());
        
        // Trả về tất cả providers, bao gồm cả pending và completed
        return providerIds.stream()
            .map(this::getProviderRevenueSummary)
            .collect(Collectors.toList());
    }

    /**
     * Xử lý thanh toán cho một provider.
     * Chuyển tất cả đơn hàng APPROVED sang trạng thái PAYOUT_COMPLETED và ghi nhận thời gian thanh toán.
     * @param providerId ID của provider cần thanh toán.
     * @return Map chứa: providerId, processedOrders (số đơn đã xử lý), totalPayoutAmount (tổng tiền đã trả), timestamp, success.
     */
    @Transactional
    public Map<String, Object> processPayouts(Long providerId) {
        // Lấy tất cả orders đã APPROVED (admin đã duyệt) của provider này
        List<Order> approvedOrders = orderRepository.findByProviderIdAndStatus(providerId, "APPROVED");
        
        BigDecimal totalPayout = BigDecimal.ZERO;
        int processedCount = 0;
        
        for (Order order : approvedOrders) {
            // Dùng providerRevenue đã được tính khi admin approve
            Double providerRev = order.getProviderRevenue() != null ? order.getProviderRevenue() : 0.0;
            totalPayout = totalPayout.add(BigDecimal.valueOf(providerRev));
            
            // Đánh dấu đã thanh toán cho provider
            order.setStatus("PAYOUT_COMPLETED");
            order.setPayoutDate(LocalDateTime.now());
            orderRepository.save(order);
            processedCount++;
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("providerId", providerId);
        result.put("processedOrders", processedCount);
        result.put("totalPayoutAmount", totalPayout);
        result.put("timestamp", LocalDateTime.now());
        result.put("success", true);
        return result;
    }

    /**
     * Lớp đại diện cho chi tiết phân chia doanh thu của một đơn hàng.
     * Sử dụng Builder pattern để tạo đối tượng một cách linh hoạt.
     */
    public static class PayoutBreakdown {
        private final Long orderId;
        private final BigDecimal totalAmount;
        private final BigDecimal platformCommission;
        private final BigDecimal providerPayout;
        private final double commissionRate;
        private final LocalDateTime orderDate;

        private PayoutBreakdown(Builder builder) {
            this.orderId = builder.orderId;
            this.totalAmount = builder.totalAmount;
            this.platformCommission = builder.platformCommission;
            this.providerPayout = builder.providerPayout;
            this.commissionRate = builder.commissionRate;
            this.orderDate = builder.orderDate;
        }

        public Long getOrderId() { return orderId; }
        public BigDecimal getTotalAmount() { return totalAmount; }
        public BigDecimal getPlatformCommission() { return platformCommission; }
        public BigDecimal getProviderPayout() { return providerPayout; }
        public double getCommissionRate() { return commissionRate; }
        public LocalDateTime getOrderDate() { return orderDate; }

        public static Builder builder() {
            return new Builder();
        }

        public static class Builder {
            private Long orderId;
            private BigDecimal totalAmount;
            private BigDecimal platformCommission;
            private BigDecimal providerPayout;
            private double commissionRate;
            private LocalDateTime orderDate;

            public Builder orderId(Long orderId) {
                this.orderId = orderId;
                return this;
            }

            public Builder totalAmount(BigDecimal totalAmount) {
                this.totalAmount = totalAmount;
                return this;
            }

            public Builder platformCommission(BigDecimal platformCommission) {
                this.platformCommission = platformCommission;
                return this;
            }

            public Builder providerPayout(BigDecimal providerPayout) {
                this.providerPayout = providerPayout;
                return this;
            }

            public Builder commissionRate(double commissionRate) {
                this.commissionRate = commissionRate;
                return this;
            }

            public Builder orderDate(LocalDateTime orderDate) {
                this.orderDate = orderDate;
                return this;
            }

            public PayoutBreakdown build() {
                return new PayoutBreakdown(this);
            }
        }
    }
}