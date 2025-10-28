// Mục đích: Mô hình giao dịch (Transaction) cho billing.
// Đáp ứng: Đại diện transaction/phiếu thanh toán, lưu provider share, platform fee, phương thức và trạng thái.
package com.evmarketplace.billing;

// Mục đích: Thực thể Transaction ghi nhận từng giao dịch thanh toán.
// Đáp ứng: Cung cấp dữ liệu cho hoá đơn, báo cáo doanh thu.

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import java.math.BigDecimal;
import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "purchase_id")
    private UUID purchaseId;

    @Column(name = "subscription_id")
    private UUID subscriptionId;

    @Column(name = "amount", precision = 18, scale = 4)
    private BigDecimal amount;

    @Column(name = "provider_share", precision = 18, scale = 4)
    private BigDecimal providerShare;

    @Column(name = "platform_fee", precision = 18, scale = 4)
    private BigDecimal platformFee;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "timestamp", nullable = false)
    private Date timestamp = new Date();

    protected Transaction() {
        // Bắt buộc cho JPA
    }

    public Transaction(UUID purchaseId, BigDecimal amount) {
        this.purchaseId = purchaseId;
        this.amount = amount;
    }

    public UUID getId() {
        return id;
    }

    public UUID getPurchaseId() {
        return purchaseId;
    }

    public void setPurchaseId(UUID purchaseId) {
        this.purchaseId = purchaseId;
    }

    public UUID getSubscriptionId() {
        return subscriptionId;
    }

    public void setSubscriptionId(UUID subscriptionId) {
        this.subscriptionId = subscriptionId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getProviderShare() {
        return providerShare;
    }

    public void setProviderShare(BigDecimal providerShare) {
        this.providerShare = providerShare;
    }

    public BigDecimal getPlatformFee() {
        return platformFee;
    }

    public void setPlatformFee(BigDecimal platformFee) {
        this.platformFee = platformFee;
    }

    public PaymentMethod getMethod() {
        return method;
    }

    public void setMethod(PaymentMethod method) {
        this.method = method;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public Date getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Date timestamp) {
        this.timestamp = timestamp;
    }
}
