package com.evmarketplace.providers;

// Mục đích: Thực thể JPA cho nhà cung cấp dữ liệu (DataProvider).
// Đáp ứng: Lưu thông tin cần thiết để ánh xạ User đã được phê duyệt thành một thực thể nhà cung cấp
// qua JPA, đảm bảo Spring Data có thể quản lý/persist đối tượng này.

import com.evmarketplace.Pojo.User;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "data_providers")
public class DataProvider {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user; // liên kết tới user đã được phê duyệt làm provider

    @Column(name = "provider_name", nullable = false)
    private String providerName;

    @Column(name = "description")
    private String description;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "approved", nullable = false)
    private boolean approved;

    protected DataProvider() {
        // Bắt buộc cho JPA
    }

    public DataProvider(User user, String providerName) {
        this.user = user;
        this.providerName = providerName;
        this.contactEmail = user != null ? user.getEmail() : null;
        this.approved = user != null && user.isProviderApproved();
    }

    public UUID getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
        if (user != null) {
            this.contactEmail = user.getEmail();
            this.approved = user.isProviderApproved();
        }
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

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public boolean isApproved() {
        return approved;
    }

    public void setApproved(boolean approved) {
        this.approved = approved;
    }
}
