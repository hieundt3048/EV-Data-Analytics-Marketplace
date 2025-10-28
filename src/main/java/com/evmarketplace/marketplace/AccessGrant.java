package com.evmarketplace.marketplace;

// Mục đích: Thực thể AccessGrant lưu thông tin quyền truy cập dataset của consumer.
// Đáp ứng: Cần cho Spring Data quản lý thời gian cấp phép, loại truy cập.

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
import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "access_grants")
public class AccessGrant {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "consumer_id", nullable = false)
    private UUID consumerId;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Enumerated(EnumType.STRING)
    @Column(name = "access_type", nullable = false)
    private AccessType accessType;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "granted_at", nullable = false)
    private Date grantedAt;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "expires_at")
    private Date expiresAt;

    protected AccessGrant() {
        // Bắt buộc cho JPA
    }

    public AccessGrant(UUID consumerId, UUID productId, AccessType accessType) {
        this.consumerId = consumerId;
        this.productId = productId;
        this.accessType = accessType;
        this.grantedAt = new Date();
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

    public AccessType getAccessType() {
        return accessType;
    }

    public void setAccessType(AccessType accessType) {
        this.accessType = accessType;
    }

    public Date getGrantedAt() {
        return grantedAt;
    }

    public void setGrantedAt(Date grantedAt) {
        this.grantedAt = grantedAt;
    }

    public Date getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Date expiresAt) {
        this.expiresAt = expiresAt;
    }
}
