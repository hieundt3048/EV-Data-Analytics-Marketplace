// Mục đích: Mô tả profile cho người tiêu thụ dữ liệu (ConsumerProfile).
// Đáp ứng: Lưu thông tin liên quan tới consumer (tổ chức/chi tiết liên lạc, thông tin thanh toán) theo yêu cầu sản phẩm.
package com.evmarketplace.Pojo;

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
@Table(name = "consumer_profiles")
public class ConsumerProfile {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user; // liên kết tới User

    @Column(name = "organization")
    private String organization;

    @Column(name = "contact_name")
    private String contactName;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "billing_account")
    private String billingAccount;

    public ConsumerProfile() {}

    public UUID getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getOrganization() {
        return organization;
    }

    public void setOrganization(String organization) {
        this.organization = organization;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getBillingAccount() {
        return billingAccount;
    }

    public void setBillingAccount(String billingAccount) {
        this.billingAccount = billingAccount;
    }
}
