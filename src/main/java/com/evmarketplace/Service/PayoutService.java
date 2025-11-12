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

@Service
public class PayoutService {

    private static final double PLATFORM_COMMISSION_RATE = 0.20;

    private final OrderRepository orderRepository;

    public PayoutService(OrderRepository orderRepository, DataProviderRepository dataProviderRepository) {
        this.orderRepository = orderRepository;
    }

    public PayoutBreakdown calculatePayoutBreakdown(Order order) {
        BigDecimal totalAmount = BigDecimal.valueOf(order.getAmount());
        BigDecimal platformCommission = totalAmount.multiply(BigDecimal.valueOf(PLATFORM_COMMISSION_RATE)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal providerPayout = totalAmount.subtract(platformCommission).setScale(2, RoundingMode.HALF_UP);
        return PayoutBreakdown.builder().orderId(order.getId()).totalAmount(totalAmount).platformCommission(platformCommission).providerPayout(providerPayout).commissionRate(PLATFORM_COMMISSION_RATE).orderDate(order.getOrderDate()).build();
    }

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

    public Map<String, Object> getProviderRevenueSummary(Long providerId) {
        List<Order> allOrders = orderRepository.findByProviderId(providerId);
        // Chi tinh orders da duoc APPROVED (admin da duyet)
        List<Order> approvedOrders = allOrders.stream()
            .filter(o -> "APPROVED".equals(o.getStatus()))
            .collect(Collectors.toList());
        
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalCommission = BigDecimal.ZERO;
        BigDecimal totalNetPayout = BigDecimal.ZERO;
        
        for (Order order : approvedOrders) {
            // Dung providerRevenue va platformRevenue da duoc tinh khi admin approve
            Double amount = order.getAmount() != null ? order.getAmount() : 0.0;
            Double providerRev = order.getProviderRevenue() != null ? order.getProviderRevenue() : 0.0;
            Double platformRev = order.getPlatformRevenue() != null ? order.getPlatformRevenue() : 0.0;
            
            totalRevenue = totalRevenue.add(BigDecimal.valueOf(amount));
            totalCommission = totalCommission.add(BigDecimal.valueOf(platformRev));
            totalNetPayout = totalNetPayout.add(BigDecimal.valueOf(providerRev));
        }
        
        // Dem orders PENDING (chua duyet)
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

    public Map<String, Object> getPlatformRevenueStats(LocalDateTime startDate, LocalDateTime endDate) {
        // Neu khong co filter date thi lay tat ca orders
        List<Order> orders;
        if (startDate != null && endDate != null) {
            orders = orderRepository.findByOrderDateBetween(startDate, endDate);
        } else {
            orders = orderRepository.findAll();
        }
        
        // Chi tinh orders da APPROVED
        List<Order> approvedOrders = orders.stream()
            .filter(o -> "APPROVED".equals(o.getStatus()))
            .collect(Collectors.toList());
        
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalCommission = BigDecimal.ZERO;
        BigDecimal totalProviderPayouts = BigDecimal.ZERO;
        
        for (Order order : approvedOrders) {
            Double amount = order.getAmount() != null ? order.getAmount() : 0.0;
            Double providerRev = order.getProviderRevenue() != null ? order.getProviderRevenue() : 0.0;
            Double platformRev = order.getPlatformRevenue() != null ? order.getPlatformRevenue() : 0.0;
            
            totalRevenue = totalRevenue.add(BigDecimal.valueOf(amount));
            totalCommission = totalCommission.add(BigDecimal.valueOf(platformRev));
            totalProviderPayouts = totalProviderPayouts.add(BigDecimal.valueOf(providerRev));
        }
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("startDate", startDate);
        stats.put("endDate", endDate);
        stats.put("totalRevenue", totalRevenue);
        stats.put("platformCommission", totalCommission);
        stats.put("providerPayouts", totalProviderPayouts);
        stats.put("totalOrders", approvedOrders.size());
        stats.put("commissionRate", PLATFORM_COMMISSION_RATE);
        return stats;
    }

    public List<Map<String, Object>> getAllProviderPayouts() {
        // Get all unique provider IDs from orders
        List<Long> providerIds = orderRepository.findAll().stream()
            .map(Order::getProviderId)
            .filter(Objects::nonNull)
            .distinct()
            .collect(Collectors.toList());
        
        // Tra ve tat ca providers, bao gom ca pending va completed
        return providerIds.stream()
            .map(this::getProviderRevenueSummary)
            .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> processPayouts(Long providerId) {
        // Lay tat ca orders da APPROVED (admin da duyet) cua provider nay
        List<Order> approvedOrders = orderRepository.findByProviderIdAndStatus(providerId, "APPROVED");
        
        BigDecimal totalPayout = BigDecimal.ZERO;
        int processedCount = 0;
        
        for (Order order : approvedOrders) {
            // Dung providerRevenue da duoc tinh khi admin approve
            Double providerRev = order.getProviderRevenue() != null ? order.getProviderRevenue() : 0.0;
            totalPayout = totalPayout.add(BigDecimal.valueOf(providerRev));
            
            // Danh dau da thanh toan cho provider
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