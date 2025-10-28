// Mục đích: Mô tả profile của nhà cung cấp (ProviderProfile).
// Đáp ứng: Đại diện ProviderProfile theo class diagram, lưu các thông tin như tên, mô tả, tài khoản ngân hàng, xếp hạng.
package com.evmarketplace.Pojo;

// Mục đích: Thực thể ProviderProfile mở rộng thông tin hồ sơ của nhà cung cấp.
// Đáp ứng: Cho phép lưu mô tả, thông tin thanh toán, rating gắn với User đã đăng ký.

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "provider_profiles")
public class ProviderProfile {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "provider_name", nullable = false)
    private String providerName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "bank_account")
    private String bankAccount;

    @Column(name = "rating")
    private double rating;

    protected ProviderProfile() {
        // Bắt buộc cho JPA
    }

    public ProviderProfile(User user, String providerName) {
        this.user = user;
        this.providerName = providerName;
    }

    public UUID getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getProviderName() {
        return providerName;
    }

    public void setProviderName(String providerName) {
        this.providerName = providerName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getBankAccount() {
        return bankAccount;
    }

    public void setBankAccount(String bankAccount) {
        this.bankAccount = bankAccount;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }
}
