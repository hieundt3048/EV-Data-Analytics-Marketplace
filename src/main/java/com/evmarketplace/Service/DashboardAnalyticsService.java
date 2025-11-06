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
        if (datasetOpt.isEmpty()) {
            throw new RuntimeException("Dataset not found with ID: " + datasetId);
        }

        Dataset dataset = datasetOpt.get();
        
        // Tạo dữ liệu tổng hợp cho dashboard
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

    private Map<String, Object> calculateSummaryMetrics(Long datasetId) {
        Map<String, Object> metrics = new HashMap<>();
        
        // Lấy thông tin orders cho dataset này
        List<Order> datasetOrders = orderRepository.findAll().stream()
                .filter(order -> order.getDatasetId().equals(datasetId))
                .collect(Collectors.toList());

        // Tính toán metrics
        double totalRevenue = datasetOrders.stream()
                .filter(order -> "PAID".equals(order.getStatus()))
                .mapToDouble(Order::getAmount)
                .sum();

        long totalOrders = datasetOrders.stream()
                .filter(order -> "PAID".equals(order.getStatus()))
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