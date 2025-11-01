package com.evmarketplace.Service.impl;

import com.evmarketplace.Repository.OrderRepository;
import com.evmarketplace.Service.RevenueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class RevenueServiceImpl implements RevenueService {

    @Autowired
    private OrderRepository orderRepository;

    @Override
    public Map<String, Object> getRevenueSummary() {
        Double totalRevenue = orderRepository.calculateTotalRevenue();
        Long totalOrders = orderRepository.countOrders();

        Map<String, Object> report = new HashMap<>();
        report.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);
        report.put("totalOrders", totalOrders);
        return report;
    }
}
