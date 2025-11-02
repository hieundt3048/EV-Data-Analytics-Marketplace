package com.evmarketplace.marketplace;

// Mục đích: Thực thể Subscription quản lý gói dịch vụ định kỳ của consumer.
// Đáp ứng: Lưu trạng thái, thời gian hiệu lực và phí định kỳ.

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

@Entity(name = "MarketplaceSubscription")
@Table(name = "subscriptions")
public class Subscription {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "consumer_id", nullable = false)
    private UUID consumerId;

    @Column(name = "plan_id")
    private UUID planId;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "start_date", nullable = false)
    private Date startDate = new Date();

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "end_date")
    private Date endDate;

    @Column(name = "recurring_fee", precision = 18, scale = 4)
    private BigDecimal recurringFee;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private SubscriptionStatus status = SubscriptionStatus.ACTIVE;

    protected Subscription() {
        // Bắt buộc cho JPA
    }

    public Subscription(UUID consumerId, UUID planId) {
        this.consumerId = consumerId;
        this.planId = planId;
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

    public UUID getPlanId() {
        return planId;
    }

    public void setPlanId(UUID planId) {
        this.planId = planId;
    }

    public Date getStartDate() {
        return startDate;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public Date getEndDate() {
        return endDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }

    public BigDecimal getRecurringFee() {
        return recurringFee;
    }

    public void setRecurringFee(BigDecimal recurringFee) {
        this.recurringFee = recurringFee;
    }

    public SubscriptionStatus getStatus() {
        return status;
    }

    public void setStatus(SubscriptionStatus status) {
        this.status = status;
    }
}
