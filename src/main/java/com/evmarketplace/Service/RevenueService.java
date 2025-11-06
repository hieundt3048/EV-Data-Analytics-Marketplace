package com.evmarketplace.Service;

import com.evmarketplace.Pojo.RevenueReportDTO;
import com.evmarketplace.Repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RevenueService {

    private final OrderRepository orderRepository;

    public RevenueService(OrderRepository orderRepository) { this.orderRepository = orderRepository; }

    public RevenueReportDTO getRevenueSummaryForProvider(Long providerId) {
        Double totalRevenue = orderRepository.getTotalRevenueByProvider(providerId);
        Long totalOrders = orderRepository.getTotalOrdersByProvider(providerId);
        List<RevenueReportDTO.MonthlyRevenue> monthly = orderRepository.getMonthlyRevenue(providerId).stream()
                .map(obj -> new RevenueReportDTO.MonthlyRevenue(((Integer) obj[0]), ((Double) obj[1])))
                .collect(Collectors.toList());
        return new RevenueReportDTO(totalRevenue, totalOrders, monthly);
    }
}
