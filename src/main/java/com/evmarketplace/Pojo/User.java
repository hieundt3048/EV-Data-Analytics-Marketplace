// Mục đích: Mô hình người dùng (User) - skeleton đơn giản cho backend.
// Đáp ứng: Đại diện thực thể User trong class diagram, dùng cho auth và liên kết profile/api key.
package com.evmarketplace.Pojo;

import javax.persistence.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

/**
 * User entity (JPA) - stores users in database.
 * Converted from skeleton POJO to a proper JPA entity so authentication
 * can persist and validate credentials against the database.
 */
@Entity
@Table(name = "users", indexes = {@Index(columnList = "email", name = "idx_users_email")})
public class User implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column
    private String organization;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    public User() {}

    public User(String name, String email, String passwordHash) {
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getOrganization() {
        return organization;
    }

    public void setOrganization(String organization) {
        this.organization = organization;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

    public void addRole(Role r) {
        this.roles.add(r);
    }

    @Column(nullable = false, columnDefinition = "BIT DEFAULT 0")
    private boolean providerApproved = false; // provider accounts require admin approval

    public boolean isProviderApproved() {
        return providerApproved;
    }

    public void setProviderApproved(boolean providerApproved) {
        this.providerApproved = providerApproved;
    }
}
