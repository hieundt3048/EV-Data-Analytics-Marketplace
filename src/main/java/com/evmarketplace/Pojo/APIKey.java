// Mục đích: Mô hình khoá API (APIKey) cho consumer.
// Đáp ứng: Đại diện entity APIKey trong class diagram, chứa key, scopes, hạn mức và thời hạn.
package com.evmarketplace.Pojo;

// Mục đích: Thực thể APIKey lưu khóa truy cập được phát hành cho consumer.
// Đáp ứng: Chuyển POJO sang JPA entity để Spring Data quản lý khoá API, bao gồm danh sách scope.

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.CollectionTable;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "api_keys")
public class APIKey {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "consumer_id", nullable = false)
    private UUID consumerId;

    @Column(name = "api_key", nullable = false, unique = true)
    private String key;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "api_key_scopes", joinColumns = @JoinColumn(name = "api_key_id"))
    @Column(name = "scope")
    private List<String> scopes = new ArrayList<>();

    @Column(name = "rate_limit")
    private int rateLimit;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at", nullable = false, updatable = false)
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "expires_at")
    private Date expiresAt;

    protected APIKey() {
        // Bắt buộc cho JPA
        this.createdAt = new Date();
    }

    public APIKey(UUID consumerId, String key) {
        this.consumerId = consumerId;
        this.key = key;
        this.createdAt = new Date();
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

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public List<String> getScopes() {
        return scopes;
    }

    public void setScopes(List<String> scopes) {
        this.scopes = scopes;
    }

    public int getRateLimit() {
        return rateLimit;
    }

    public void setRateLimit(int rateLimit) {
        this.rateLimit = rateLimit;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public Date getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Date expiresAt) {
        this.expiresAt = expiresAt;
    }
    
    // Alias methods for compatibility
    public Date getExpiryDate() {
        return expiresAt;
    }
    
    public void setExpiryDate(Date expiryDate) {
        this.expiresAt = expiryDate;
    }
}
