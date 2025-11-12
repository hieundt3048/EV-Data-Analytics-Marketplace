package com.evmarketplace.Pojo;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity Order đại diện cho đơn hàng dataset giữa provider và buyer.
 * Dùng cho truy vấn doanh thu và lịch sử mua hàng.
 */

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ID dataset được mua
    @Column(name = "dataset_id", nullable = false)
    private Long datasetId;

    // Người mua - temporarily nullable to avoid FK constraint issues
    @Column(name = "buyer_id")
    private Long buyerId;

    // Nhà cung cấp dữ liệu - temporarily nullable to avoid FK constraint issues  
    @Column(name = "provider_id")
    private Long providerId;

    // Số tiền thanh toán
    @Column(nullable = false)
    private Double amount;

    // Ngày đặt hàng
    @Column(name = "order_date", nullable = false)
    private LocalDateTime orderDate;

    // Trạng thái đơn hàng: PAID, PENDING, CANCELLED
    @Column(nullable = false, length = 20)
    private String status;

    // Ngày thanh toán cho provider
    @Column(name = "payout_date")
    private LocalDateTime payoutDate;

    // Doanh thu của nền tảng (30%)
    @Column(name = "platform_revenue")
    private Double platformRevenue;

    // Doanh thu của provider (70%)
    @Column(name = "provider_revenue")
    private Double providerRevenue;

    // --- Constructors ---
    public Order() {}

    public Order(Long datasetId, Long buyerId, Long providerId, Double amount, LocalDateTime orderDate, String status) {
        this.datasetId = datasetId;
        this.buyerId = buyerId;
        this.providerId = providerId;
        this.amount = amount;
        this.orderDate = orderDate;
        this.status = status;
    }

    // --- Getters & Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDatasetId() { return datasetId; }
    public void setDatasetId(Long datasetId) { this.datasetId = datasetId; }

    public Long getBuyerId() { return buyerId; }
    public void setBuyerId(Long buyerId) { this.buyerId = buyerId; }

    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getPayoutDate() { return payoutDate; }
    public void setPayoutDate(LocalDateTime payoutDate) { this.payoutDate = payoutDate; }

    public Double getPlatformRevenue() { return platformRevenue; }
    public void setPlatformRevenue(Double platformRevenue) { this.platformRevenue = platformRevenue; }

    public Double getProviderRevenue() { return providerRevenue; }
    public void setProviderRevenue(Double providerRevenue) { this.providerRevenue = providerRevenue; }
}
