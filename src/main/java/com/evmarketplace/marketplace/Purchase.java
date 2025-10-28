package com.evmarketplace.marketplace;

// Mục đích: Thực thể Purchase lưu đơn mua dữ liệu của consumer.
// Đáp ứng: Cho phép Spring Data lưu trạng thái, chi phí và tham chiếu tới sản phẩm.

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
@Table(name = "purchases")
public class Purchase {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "consumer_id", nullable = false)
    private UUID consumerId;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "pricing_policy_id")
    private UUID pricingPolicyId;

    @Column(name = "amount", precision = 18, scale = 4)
    private BigDecimal amount;

    @Column(name = "currency", length = 8)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PurchaseStatus status = PurchaseStatus.INITIATED;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at", nullable = false)
    private Date createdAt = new Date();

    protected Purchase() {
        // Bắt buộc cho JPA
    }

    public Purchase(UUID consumerId, UUID productId) {
        this.consumerId = consumerId;
        this.productId = productId;
    }

    public UUID getId() {
        return id;
    }

    public UUID getConsumerId() {
        return consumerId;
    }

    public void setConsumerId(UUID consumerId) {
        this.consumerId = consumerId;
    }

    public UUID getProductId() {
        return productId;
    }

    public void setProductId(UUID productId) {
        this.productId = productId;
    }

    public UUID getPricingPolicyId() {
        return pricingPolicyId;
    }

    public void setPricingPolicyId(UUID pricingPolicyId) {
        this.pricingPolicyId = pricingPolicyId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public PurchaseStatus getStatus() {
        return status;
    }

    public void setStatus(PurchaseStatus status) {
        this.status = status;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
}
