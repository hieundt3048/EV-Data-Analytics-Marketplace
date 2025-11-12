package com.evmarketplace.Service;

import com.evmarketplace.Pojo.Dataset;
import com.evmarketplace.Pojo.Order;
import com.evmarketplace.Repository.DatasetRepository;
import com.evmarketplace.Repository.OrderRepository;
import com.evmarketplace.dto.DashboardDataDTO;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardAnalyticsService {

    private final DatasetRepository datasetRepository;
    private final OrderRepository orderRepository;

    public DashboardAnalyticsService(DatasetRepository datasetRepository, OrderRepository orderRepository) {
        this.datasetRepository = datasetRepository;
        this.orderRepository = orderRepository;
    }

    public DashboardDataDTO getDashboardData(Long datasetId) {
        Optional<Dataset> datasetOpt = datasetRepository.findById(datasetId);
        
        // If dataset not found, return mock data for testing
        if (datasetOpt.isEmpty()) {
            return createMockDashboardData(datasetId);
        }

        Dataset dataset = datasetOpt.get();
        
        // Check if there are any orders for this dataset
        List<Order> datasetOrders = orderRepository.findAll().stream()
                .filter(order -> order.getDatasetId().equals(datasetId))
                .collect(java.util.stream.Collectors.toList());
        
        // If no orders, return mock data for better UX
        if (datasetOrders.isEmpty()) {
            DashboardDataDTO mockData = createMockDashboardData(datasetId);
            mockData.setDatasetTitle(dataset.getTitle()); // Use real dataset title
            return mockData;
        }
        
        // Tạo dữ liệu tổng hợp cho dashboard từ orders thật
        Map<String, Object> summaryMetrics = calculateSummaryMetrics(datasetId);
        List<DashboardDataDTO.TimeSeriesData> timeSeries = generateTimeSeriesData(datasetId);
        List<DashboardDataDTO.CategoryData> categories = generateCategoryData(datasetId);
        Map<String, Object> insights = generateInsights(datasetId);

        DashboardDataDTO dashboardData = new DashboardDataDTO();
        dashboardData.setDatasetId(datasetId);
        dashboardData.setDatasetTitle(dataset.getTitle());
        dashboardData.setSummaryMetrics(summaryMetrics);
        dashboardData.setTimeSeries(timeSeries);
        dashboardData.setCategories(categories);
        dashboardData.setInsights(insights);

        return dashboardData;
    }
    
    private DashboardDataDTO createMockDashboardData(Long datasetId) {
        DashboardDataDTO mockData = new DashboardDataDTO();
        mockData.setDatasetId(datasetId);
        mockData.setDatasetTitle("Sample Dataset " + datasetId);
        
        // Mock summary metrics
        Map<String, Object> summaryMetrics = new HashMap<>();
        summaryMetrics.put("totalRecords", 1250);
        summaryMetrics.put("avgBatteryHealth", 87.5);
        summaryMetrics.put("totalMileage", 125000);
        summaryMetrics.put("avgChargingTime", 45);
        mockData.setSummaryMetrics(summaryMetrics);
        
        // Mock time series data
        List<DashboardDataDTO.TimeSeriesData> timeSeries = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            DashboardDataDTO.TimeSeriesData ts = new DashboardDataDTO.TimeSeriesData();
            ts.setTimestamp("2025-" + String.format("%02d", i) + "-01");
            ts.setValue(80 + (Math.random() * 20));
            ts.setMetric("Battery Health");
            timeSeries.add(ts);
        }
        mockData.setTimeSeries(timeSeries);
        
        // Mock category data
        List<DashboardDataDTO.CategoryData> categories = new ArrayList<>();
        String[] categoryNames = {"Battery Health", "Charging", "Driving", "Energy"};
        for (String name : categoryNames) {
            DashboardDataDTO.CategoryData cat = new DashboardDataDTO.CategoryData();
            cat.setCategory(name);
            cat.setValue(Math.random() * 100);
            cat.setCount((long)(Math.random() * 100));
            categories.add(cat);
        }
        mockData.setCategories(categories);
        
        // Mock insights
        Map<String, Object> insights = new HashMap<>();
        insights.put("prediction", "Battery health trending upward");
        insights.put("recommendation", "Optimal charging schedule detected");
        insights.put("anomalyDetected", false);
        mockData.setInsights(insights);
        
        return mockData;
    }

    private Map<String, Object> calculateSummaryMetrics(Long datasetId) {
        Map<String, Object> metrics = new HashMap<>();
        
        // Lấy thông tin orders cho dataset này
        List<Order> datasetOrders = orderRepository.findAll().stream()
                .filter(order -> order.getDatasetId().equals(datasetId))
                .collect(Collectors.toList());

        // Tinh toan metrics chi tu orders da APPROVED
        double totalRevenue = datasetOrders.stream()
                .filter(order -> "APPROVED".equals(order.getStatus()))
                .mapToDouble(Order::getAmount)
                .sum();

        long totalOrders = datasetOrders.stream()
                .filter(order -> "APPROVED".equals(order.getStatus()))
                .count();

        double averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Tỉ lệ conversion (giả lập)
        double conversionRate = datasetOrders.size() > 0 ? 
                (double) totalOrders / datasetOrders.size() * 100 : 0;

        metrics.put("totalRevenue", Math.round(totalRevenue * 100.0) / 100.0);
        metrics.put("totalOrders", totalOrders);
        metrics.put("averageOrderValue", Math.round(averageOrderValue * 100.0) / 100.0);
        metrics.put("conversionRate", Math.round(conversionRate * 100.0) / 100.0);
        metrics.put("activeUsers", datasetOrders.stream().map(Order::getBuyerId).distinct().count());

        return metrics;
    }

    private List<DashboardDataDTO.TimeSeriesData> generateTimeSeriesData(Long datasetId) {
        List<DashboardDataDTO.TimeSeriesData> timeSeries = new ArrayList<>();
        
        // Giả lập dữ liệu time series cho 7 ngày qua
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        Random random = new Random();
        
        for (int i = 6; i >= 0; i--) {
            LocalDateTime date = now.minusDays(i);
            String dateStr = date.format(formatter);
            
            // Revenue data
            timeSeries.add(new DashboardDataDTO.TimeSeriesData(
                dateStr, 
                1000 + random.nextDouble() * 500, 
                "revenue"
            ));
            
            // Orders data
            timeSeries.add(new DashboardDataDTO.TimeSeriesData(
                dateStr, 
                (double) (5 + random.nextInt(10)), 
                "orders"
            ));
            
            // Users data
            timeSeries.add(new DashboardDataDTO.TimeSeriesData(
                dateStr, 
                (double) (3 + random.nextInt(7)), 
                "users"
            ));
        }
        
        return timeSeries;
    }

    private List<DashboardDataDTO.CategoryData> generateCategoryData(Long datasetId) {
        List<DashboardDataDTO.CategoryData> categories = new ArrayList<>();
        
        // Giả lập dữ liệu phân loại
        String[] regionCategories = {"North America", "Europe", "Asia Pacific", "Latin America"};
        Random random = new Random();
        
        for (String region : regionCategories) {
            categories.add(new DashboardDataDTO.CategoryData(
                region,
                500 + random.nextDouble() * 1500,
                10L + random.nextInt(40)
            ));
        }
        
        return categories;
    }

    private Map<String, Object> generateInsights(Long datasetId) {
        Map<String, Object> insights = new HashMap<>();
        
        // Giả lập insights phân tích
        insights.put("topPerformingRegion", "Asia Pacific");
        insights.put("growthRate", 15.7);
        insights.put("peakHours", Arrays.asList("09:00-11:00", "14:00-16:00"));
        insights.put("recommendation", "Consider expanding dataset coverage in European markets");
        insights.put("trend", "upward");
        insights.put("confidenceScore", 87.5);
        
        return insights;
    }

    // Thêm method cho advanced analytics với JPQL
    public Map<String, Object> getAdvancedMetrics(Long datasetId) {
        Map<String, Object> advancedMetrics = new HashMap<>();
        
        // Sử dụng repository methods có sẵn hoặc custom queries
        Double totalRevenue = orderRepository.getTotalRevenueByProvider(datasetId);
        Long totalOrders = orderRepository.getTotalOrdersByProvider(datasetId);
        
        advancedMetrics.put("providerRevenue", totalRevenue != null ? totalRevenue : 0.0);
        advancedMetrics.put("providerOrders", totalOrders != null ? totalOrders : 0L);
        advancedMetrics.put("marketShare", calculateMarketShare(datasetId));
        advancedMetrics.put("customerSatisfaction", 4.5); // Giả lập
        
        return advancedMetrics;
    }

    private double calculateMarketShare(Long datasetId) {
        // Giả lập tính market share
        return 12.5 + (new Random().nextDouble() * 10);
    }
}