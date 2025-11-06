package com.evmarketplace.Pojo;

import java.util.List;

public class RevenueReportDTO {
    private Double totalRevenue;
    private Long totalOrders;
    private List<MonthlyRevenue> monthlyRevenue;

    public RevenueReportDTO() {}

    public RevenueReportDTO(Double totalRevenue, Long totalOrders, List<MonthlyRevenue> monthlyRevenue) {
        this.totalRevenue = totalRevenue;
        this.totalOrders = totalOrders;
        this.monthlyRevenue = monthlyRevenue;
    }

    public static class MonthlyRevenue {
        private Integer month;
        private Double revenue;
        public MonthlyRevenue() {}
        public MonthlyRevenue(Integer month, Double revenue) { this.month = month; this.revenue = revenue; }
        public Integer getMonth() { return month; }
        public void setMonth(Integer month) { this.month = month; }
        public Double getRevenue() { return revenue; }
        public void setRevenue(Double revenue) { this.revenue = revenue; }
    }

    public Double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(Double totalRevenue) { this.totalRevenue = totalRevenue; }
    public Long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Long totalOrders) { this.totalOrders = totalOrders; }
    public List<MonthlyRevenue> getMonthlyRevenue() { return monthlyRevenue; }
    public void setMonthlyRevenue(List<MonthlyRevenue> monthlyRevenue) { this.monthlyRevenue = monthlyRevenue; }
}
