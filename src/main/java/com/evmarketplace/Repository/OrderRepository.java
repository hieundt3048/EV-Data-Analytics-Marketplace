package com.evmarketplace.Repository;

import com.evmarketplace.Pojo.Order;// chua co model Order
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT SUM(o.totalAmount) FROM Order o")
    Double calculateTotalRevenue();

    @Query("SELECT COUNT(o) FROM Order o")
    Long countOrders();
}
