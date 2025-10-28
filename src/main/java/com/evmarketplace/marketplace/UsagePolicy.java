package com.evmarketplace.marketplace;

// Mục đích: Thực thể UsagePolicy diễn tả điều khoản sử dụng dataset.
// Đáp ứng: Cho phép lưu các hạn chế sử dụng trong CSDL.

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.CollectionTable;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "usage_policies")
public class UsagePolicy {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Enumerated(EnumType.STRING)
    @Column(name = "allowed_use", nullable = false)
    private AllowedUse allowedUse;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "usage_policy_restrictions", joinColumns = @JoinColumn(name = "policy_id"))
    @Column(name = "restriction")
    private List<String> restrictions = new ArrayList<>();

    protected UsagePolicy() {
        // Bắt buộc cho JPA
    }

    public UsagePolicy(UUID productId, AllowedUse allowedUse) {
        this.productId = productId;
        this.allowedUse = allowedUse;
    }

    public UUID getId() {
        return id;
    }

    public UUID getProductId() {
        return productId;
    }

    public void setProductId(UUID productId) {
        this.productId = productId;
    }

    public AllowedUse getAllowedUse() {
        return allowedUse;
    }

    public void setAllowedUse(AllowedUse allowedUse) {
        this.allowedUse = allowedUse;
    }

    public List<String> getRestrictions() {
        return restrictions;
    }

    public void setRestrictions(List<String> restrictions) {
        this.restrictions = restrictions;
    }
}
