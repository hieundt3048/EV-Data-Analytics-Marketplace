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
        List<Order> paidOrders = orderRepository.findByProviderIdAndStatus(providerId, "PAID");
        return paidOrders.stream().map(order -> {
            PayoutBreakdown breakdown = calculatePayoutBreakdown(order);
            Map<String, Object> payout = new HashMap<>();
            payout.put("orderId", order.getId());
            payout.put("orderDate", order.getOrderDate());
            payout.put("buyerId", order.getBuyerId());
            payout.put("datasetId", order.getDatasetId());
            payout.put("totalAmount", breakdown.getTotalAmount());
            payout.put("platformCommission", breakdown.getPlatformCommission());
            payout.put("providerPayout", breakdown.getProviderPayout());
            payout.put("status", order.getStatus());
            return payout;
        }).collect(Collectors.toList());
    }

    public Map<String, Object> getProviderRevenueSummary(Long providerId) {
        List<Order> allOrders = orderRepository.findByProviderId(providerId);
        List<Order> paidOrders = allOrders.stream().filter(o -> "PAID".equals(o.getStatus()) || "PAYOUT_COMPLETED".equals(o.getStatus())).collect(Collectors.toList());
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalCommission = BigDecimal.ZERO;
        BigDecimal totalNetPayout = BigDecimal.ZERO;
        int pendingPayoutsCount = 0;
        for (Order order : paidOrders) {
            PayoutBreakdown breakdown = calculatePayoutBreakdown(order);
            totalRevenue = totalRevenue.add(breakdown.getTotalAmount());
            totalCommission = totalCommission.add(breakdown.getPlatformCommission());
            totalNetPayout = totalNetPayout.add(breakdown.getProviderPayout());
            if ("PAID".equals(order.getStatus())) {
                pendingPayoutsCount++;
            }
        }
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("providerId", providerId);
        summary.put("providerName", "Provider #" + providerId);
        summary.put("providerEmail", "N/A");
        summary.put("totalRevenue", totalRevenue);
        summary.put("totalCommission", totalCommission);
        summary.put("totalNetPayout", totalNetPayout);
        summary.put("pendingPayoutsCount", pendingPayoutsCount);
        summary.put("totalOrdersCount", paidOrders.size());
        return summary;
    }

    public Map<String, Object> getPlatformRevenueStats(LocalDateTime startDate, LocalDateTime endDate) {
        List<Order> orders = orderRepository.findByOrderDateBetween(startDate, endDate);
        List<Order> paidOrders = orders.stream().filter(o -> "PAID".equals(o.getStatus()) || "PAYOUT_COMPLETED".equals(o.getStatus())).collect(Collectors.toList());
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalCommission = BigDecimal.ZERO;
        BigDecimal totalProviderPayouts = BigDecimal.ZERO;
        for (Order order : paidOrders) {
            PayoutBreakdown breakdown = calculatePayoutBreakdown(order);
            totalRevenue = totalRevenue.add(breakdown.getTotalAmount());
            totalCommission = totalCommission.add(breakdown.getPlatformCommission());
            totalProviderPayouts = totalProviderPayouts.add(breakdown.getProviderPayout());
        }
        Map<String, Object> stats = new HashMap<>();
        stats.put("startDate", startDate);
        stats.put("endDate", endDate);
        stats.put("totalRevenue", totalRevenue);
        stats.put("platformCommission", totalCommission);
        stats.put("providerPayouts", totalProviderPayouts);
        stats.put("totalOrders", paidOrders.size());
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
        
        return providerIds.stream().map(providerId -> {
            Map<String, Object> summary = getProviderRevenueSummary(providerId);
            int pendingCount = (int) summary.get("pendingPayoutsCount");
            if (pendingCount > 0) {
                return summary;
            }
            return null;
        }).filter(Objects::nonNull).collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> processPayouts(Long providerId) {
        List<Order> paidOrders = orderRepository.findByProviderIdAndStatus(providerId, "PAID");
        BigDecimal totalPayout = BigDecimal.ZERO;
        int processedCount = 0;
        for (Order order : paidOrders) {
            PayoutBreakdown breakdown = calculatePayoutBreakdown(order);
            totalPayout = totalPayout.add(breakdown.getProviderPayout());
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