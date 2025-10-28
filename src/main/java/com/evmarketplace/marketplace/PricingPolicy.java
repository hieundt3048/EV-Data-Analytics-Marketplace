package com.evmarketplace.marketplace;

// Mục đích: Thực thể PricingPolicy mô tả chính sách giá cho DataProduct.
// Đáp ứng: Lưu thông tin model giá, đơn vị tính và đơn vị tiền tệ trong CSDL.

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "pricing_policies")
public class PricingPolicy {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Enumerated(EnumType.STRING)
    @Column(name = "model", nullable = false)
    private PricingModel model;

    @Column(name = "price", precision = 18, scale = 4)
    private BigDecimal price;

    @Column(name = "currency", length = 8)
    private String currency;

    @Column(name = "billing_unit")
    private String billingUnit;

    protected PricingPolicy() {
        // Bắt buộc cho JPA
    }

    public PricingPolicy(UUID productId, PricingModel model) {
        this.productId = productId;
        this.model = model;
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

    public PricingModel getModel() {
        return model;
    }

    public void setModel(PricingModel model) {
        this.model = model;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getBillingUnit() {
        return billingUnit;
    }

    public void setBillingUnit(String billingUnit) {
        this.billingUnit = billingUnit;
    }
}
