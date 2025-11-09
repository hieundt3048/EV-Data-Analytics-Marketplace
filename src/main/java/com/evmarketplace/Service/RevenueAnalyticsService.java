package com.evmarketplace.Service;

import com.evmarketplace.Pojo.Consumer;
import com.evmarketplace.Pojo.Order;
import com.evmarketplace.Pojo.ProviderDataset;
import com.evmarketplace.Repository.ConsumerRepository;
import com.evmarketplace.Repository.OrderRepository;
import com.evmarketplace.Repository.ProviderDatasetRepository;
import com.evmarketplace.dto.ProviderRevenueDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RevenueAnalyticsService {
    
    private final OrderRepository orderRepository;
    private final ProviderDatasetRepository providerDatasetRepository;
    private final ConsumerRepository consumerRepository;
    
    public RevenueAnalyticsService(OrderRepository orderRepository,
                                  ProviderDatasetRepository providerDatasetRepository,
                                  ConsumerRepository consumerRepository) {
        this.orderRepository = orderRepository;
        this.providerDatasetRepository = providerDatasetRepository;
        this.consumerRepository = consumerRepository;
    }
    
    /**
     * Get comprehensive revenue analytics for a provider
     */
    @Transactional(readOnly = true)
    public ProviderRevenueDTO getProviderRevenue(Long providerId, LocalDateTime startDate, LocalDateTime endDate) {
        ProviderRevenueDTO dto = new ProviderRevenueDTO();
        
        // Get all provider's datasets
        List<ProviderDataset> datasets = providerDatasetRepository.findByProviderId(providerId);
        List<Long> datasetIds = datasets.stream().map(ProviderDataset::getId).collect(Collectors.toList());
        
        if (datasetIds.isEmpty()) {
            return dto; // Return empty DTO
        }
        
        // Get all orders for these datasets
        List<Order> allOrders = orderRepository.findByDatasetIdIn(datasetIds);
        List<Order> paidOrders = allOrders.stream()
            .filter(o -> "PAID".equals(o.getStatus()))
            .collect(Collectors.toList());
        
        // Filter by date range if provided
        List<Order> filteredOrders = paidOrders;
        if (startDate != null && endDate != null) {
            filteredOrders = paidOrders.stream()
                .filter(o -> o.getOrderDate().isAfter(startDate) && o.getOrderDate().isBefore(endDate))
                .collect(Collectors.toList());
        }
        
        // Calculate summary metrics
        calculateSummaryMetrics(dto, paidOrders, filteredOrders);
        
        // Revenue by dataset
        dto.setRevenueByDataset(calculateRevenueByDataset(filteredOrders, datasets));
        
        // Revenue trend
        dto.setRevenueTrend(calculateRevenueTrend(filteredOrders));
        
        // Buyer demographics
        dto.setBuyerDemographics(calculateBuyerDemographics(filteredOrders));
        
        // Top datasets
        dto.setTopDatasets(calculateTopDatasets(filteredOrders, datasets));
        
        // Recent transactions
        dto.setRecentTransactions(getRecentTransactions(paidOrders, datasets, 10));
        
        return dto;
    }
    
    /**
     * Calculate summary metrics
     */
    private void calculateSummaryMetrics(ProviderRevenueDTO dto, List<Order> allOrders, List<Order> filteredOrders) {
        // Total revenue (all time)
        double totalRevenue = allOrders.stream()
            .mapToDouble(Order::getAmount)
            .sum();
        dto.setTotalRevenue(Math.round(totalRevenue * 100.0) / 100.0);
        
        // Monthly revenue (last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        double monthlyRevenue = allOrders.stream()
            .filter(o -> o.getOrderDate().isAfter(thirtyDaysAgo))
            .mapToDouble(Order::getAmount)
            .sum();
        dto.setMonthlyRevenue(Math.round(monthlyRevenue * 100.0) / 100.0);
        
        // Total downloads
        dto.setTotalDownloads(allOrders.size());
        
        // Monthly downloads
        long monthlyDownloads = allOrders.stream()
            .filter(o -> o.getOrderDate().isAfter(thirtyDaysAgo))
            .count();
        dto.setMonthlyDownloads((int) monthlyDownloads);
        
        // Total unique buyers
        long totalBuyers = allOrders.stream()
            .map(Order::getBuyerId)
            .distinct()
            .count();
        dto.setTotalBuyers((int) totalBuyers);
        
        // Active buyers (last 30 days)
        long activeBuyers = allOrders.stream()
            .filter(o -> o.getOrderDate().isAfter(thirtyDaysAgo))
            .map(Order::getBuyerId)
            .distinct()
            .count();
        dto.setActiveBuyers((int) activeBuyers);
    }
    
    /**
     * Calculate revenue breakdown by dataset
     */
    private List<ProviderRevenueDTO.DatasetRevenue> calculateRevenueByDataset(
            List<Order> orders, List<ProviderDataset> datasets) {
        
        Map<Long, ProviderDataset> datasetMap = datasets.stream()
            .collect(Collectors.toMap(ProviderDataset::getId, d -> d));
        
        Map<Long, List<Order>> ordersByDataset = orders.stream()
            .collect(Collectors.groupingBy(Order::getDatasetId));
        
        return ordersByDataset.entrySet().stream()
            .map(entry -> {
                Long datasetId = entry.getKey();
                List<Order> datasetOrders = entry.getValue();
                ProviderDataset dataset = datasetMap.get(datasetId);
                
                ProviderRevenueDTO.DatasetRevenue dr = new ProviderRevenueDTO.DatasetRevenue();
                dr.setDatasetId(datasetId);
                dr.setDatasetName(dataset != null ? dataset.getName() : "Unknown");
                
                double revenue = datasetOrders.stream().mapToDouble(Order::getAmount).sum();
                dr.setRevenue(Math.round(revenue * 100.0) / 100.0);
                
                dr.setDownloads(datasetOrders.size());
                
                long uniqueBuyers = datasetOrders.stream()
                    .map(Order::getBuyerId)
                    .distinct()
                    .count();
                dr.setUniqueBuyers((int) uniqueBuyers);
                
                return dr;
            })
            .sorted((a, b) -> Double.compare(b.getRevenue(), a.getRevenue()))
            .collect(Collectors.toList());
    }
    
    /**
     * Calculate revenue trend over time (monthly)
     */
    private List<ProviderRevenueDTO.RevenueTrend> calculateRevenueTrend(List<Order> orders) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        
        Map<String, List<Order>> ordersByMonth = orders.stream()
            .collect(Collectors.groupingBy(o -> o.getOrderDate().format(formatter)));
        
        return ordersByMonth.entrySet().stream()
            .map(entry -> {
                String month = entry.getKey();
                List<Order> monthOrders = entry.getValue();
                
                double revenue = monthOrders.stream().mapToDouble(Order::getAmount).sum();
                
                return new ProviderRevenueDTO.RevenueTrend(
                    month,
                    Math.round(revenue * 100.0) / 100.0,
                    monthOrders.size(),
                    monthOrders.size() // Downloads = orders for now
                );
            })
            .sorted(Comparator.comparing(ProviderRevenueDTO.RevenueTrend::getPeriod))
            .collect(Collectors.toList());
    }
    
    /**
     * Calculate buyer demographics
     */
    private ProviderRevenueDTO.BuyerDemographics calculateBuyerDemographics(List<Order> orders) {
        ProviderRevenueDTO.BuyerDemographics demographics = new ProviderRevenueDTO.BuyerDemographics();
        
        // Get all unique buyer IDs
        Set<Long> buyerIds = orders.stream()
            .map(Order::getBuyerId)
            .collect(Collectors.toSet());
        
        // Fetch consumer details
        List<Consumer> consumers = consumerRepository.findAllById(buyerIds);
        Map<Long, Consumer> consumerMap = consumers.stream()
            .collect(Collectors.toMap(Consumer::getId, c -> c));
        
        // By organization
        Map<String, Integer> byOrganization = consumers.stream()
            .filter(c -> c.getOrganization() != null && !c.getOrganization().isEmpty())
            .collect(Collectors.groupingBy(
                Consumer::getOrganization,
                Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
            ));
        demographics.setByOrganization(byOrganization);
        
        // By region (placeholder - would need actual region data)
        demographics.setByRegion(new HashMap<>());
        
        // By industry (placeholder - would need actual industry data)
        demographics.setByIndustry(new HashMap<>());
        
        // Top buyers
        Map<Long, List<Order>> ordersByBuyer = orders.stream()
            .collect(Collectors.groupingBy(Order::getBuyerId));
        
        List<ProviderRevenueDTO.TopBuyer> topBuyers = ordersByBuyer.entrySet().stream()
            .map(entry -> {
                Long buyerId = entry.getKey();
                List<Order> buyerOrders = entry.getValue();
                Consumer consumer = consumerMap.get(buyerId);
                
                ProviderRevenueDTO.TopBuyer tb = new ProviderRevenueDTO.TopBuyer();
                tb.setBuyerId(buyerId);
                tb.setBuyerName(consumer != null ? consumer.getName() : "Unknown");
                tb.setOrganization(consumer != null ? consumer.getOrganization() : "");
                
                double totalSpent = buyerOrders.stream().mapToDouble(Order::getAmount).sum();
                tb.setTotalSpent(Math.round(totalSpent * 100.0) / 100.0);
                tb.setPurchaseCount(buyerOrders.size());
                
                return tb;
            })
            .sorted((a, b) -> Double.compare(b.getTotalSpent(), a.getTotalSpent()))
            .limit(10)
            .collect(Collectors.toList());
        
        demographics.setTopBuyers(topBuyers);
        
        return demographics;
    }
    
    /**
     * Calculate top performing datasets
     */
    private List<ProviderRevenueDTO.TopDataset> calculateTopDatasets(
            List<Order> orders, List<ProviderDataset> datasets) {
        
        Map<Long, ProviderDataset> datasetMap = datasets.stream()
            .collect(Collectors.toMap(ProviderDataset::getId, d -> d));
        
        Map<Long, List<Order>> ordersByDataset = orders.stream()
            .collect(Collectors.groupingBy(Order::getDatasetId));
        
        return ordersByDataset.entrySet().stream()
            .map(entry -> {
                Long datasetId = entry.getKey();
                List<Order> datasetOrders = entry.getValue();
                ProviderDataset dataset = datasetMap.get(datasetId);
                
                ProviderRevenueDTO.TopDataset td = new ProviderRevenueDTO.TopDataset();
                td.setDatasetId(datasetId);
                td.setDatasetName(dataset != null ? dataset.getName() : "Unknown");
                
                double revenue = datasetOrders.stream().mapToDouble(Order::getAmount).sum();
                td.setRevenue(Math.round(revenue * 100.0) / 100.0);
                td.setDownloads(datasetOrders.size());
                
                // Calculate growth rate (placeholder - would need historical data)
                td.setGrowthRate(0.0);
                
                return td;
            })
            .sorted((a, b) -> Double.compare(b.getRevenue(), a.getRevenue()))
            .limit(10)
            .collect(Collectors.toList());
    }
    
    /**
     * Get recent transactions
     */
    private List<ProviderRevenueDTO.RecentTransaction> getRecentTransactions(
            List<Order> orders, List<ProviderDataset> datasets, int limit) {
        
        Map<Long, ProviderDataset> datasetMap = datasets.stream()
            .collect(Collectors.toMap(ProviderDataset::getId, d -> d));
        
        // Get consumer details
        Set<Long> buyerIds = orders.stream().map(Order::getBuyerId).collect(Collectors.toSet());
        List<Consumer> consumers = consumerRepository.findAllById(buyerIds);
        Map<Long, Consumer> consumerMap = consumers.stream()
            .collect(Collectors.toMap(Consumer::getId, c -> c));
        
        return orders.stream()
            .sorted((a, b) -> b.getOrderDate().compareTo(a.getOrderDate()))
            .limit(limit)
            .map(order -> {
                ProviderRevenueDTO.RecentTransaction rt = new ProviderRevenueDTO.RecentTransaction();
                rt.setOrderId(order.getId());
                rt.setDatasetId(order.getDatasetId());
                
                ProviderDataset dataset = datasetMap.get(order.getDatasetId());
                rt.setDatasetName(dataset != null ? dataset.getName() : "Unknown");
                
                Consumer consumer = consumerMap.get(order.getBuyerId());
                rt.setBuyerName(consumer != null ? consumer.getName() : "Unknown");
                
                rt.setAmount(order.getAmount());
                rt.setOrderDate(order.getOrderDate());
                rt.setStatus(order.getStatus());
                
                return rt;
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Get revenue summary for a specific dataset
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getDatasetRevenueSummary(Long datasetId) {
        List<Order> orders = orderRepository.findByDatasetId(datasetId);
        List<Order> paidOrders = orders.stream()
            .filter(o -> "PAID".equals(o.getStatus()))
            .collect(Collectors.toList());
        
        Map<String, Object> summary = new HashMap<>();
        
        double totalRevenue = paidOrders.stream().mapToDouble(Order::getAmount).sum();
        summary.put("totalRevenue", Math.round(totalRevenue * 100.0) / 100.0);
        summary.put("totalOrders", paidOrders.size());
        
        long uniqueBuyers = paidOrders.stream()
            .map(Order::getBuyerId)
            .distinct()
            .count();
        summary.put("uniqueBuyers", uniqueBuyers);
        
        double avgOrderValue = paidOrders.isEmpty() ? 0 : totalRevenue / paidOrders.size();
        summary.put("avgOrderValue", Math.round(avgOrderValue * 100.0) / 100.0);
        
        return summary;
    }
}
