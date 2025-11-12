package com.evmarketplace.Repository;

import com.evmarketplace.Pojo.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {


    // Tổng doanh thu theo provider (chi tinh orders da PAYOUT_COMPLETED)
    @Query("SELECT COALESCE(SUM(o.providerRevenue), 0) FROM Order o WHERE o.providerId = :providerId AND (o.status = 'APPROVED' OR o.status = 'PAYOUT_COMPLETED')")
    Double getTotalRevenueByProvider(@Param("providerId") Long providerId);

    // Tổng số đơn hàng theo provider
    @Query("SELECT COUNT(o) FROM Order o WHERE o.providerId = :providerId AND (o.status = 'APPROVED' OR o.status = 'PAYOUT_COMPLETED')")
    Long getTotalOrdersByProvider(@Param("providerId") Long providerId);

    // Doanh thu theo tháng (theo provider)
    @Query("SELECT FUNCTION('MONTH', o.orderDate), SUM(o.providerRevenue) " +
           "FROM Order o WHERE o.providerId = :providerId AND (o.status = 'APPROVED' OR o.status = 'PAYOUT_COMPLETED') " +
           "GROUP BY FUNCTION('MONTH', o.orderDate) ORDER BY FUNCTION('MONTH', o.orderDate)")
    List<Object[]> getMonthlyRevenue(@Param("providerId") Long providerId);

    // Lấy danh sách đơn hàng theo buyer
    List<Order> findByBuyerId(Long buyerId);
    
    // Lấy danh sách đơn hàng theo dataset ID
    List<Order> findByDatasetId(Long datasetId);
    
    // Lấy danh sách đơn hàng theo nhiều dataset IDs
    List<Order> findByDatasetIdIn(List<Long> datasetIds);
    
    // NEW: For PayoutService - Get orders by provider ID
    List<Order> findByProviderId(Long providerId);
    
    // NEW: For PayoutService - Get orders by provider ID and status
    List<Order> findByProviderIdAndStatus(Long providerId, String status);
    
    // NEW: For PayoutService - Get orders within date range
    List<Order> findByOrderDateBetween(LocalDateTime startDate, LocalDateTime endDate);
}

