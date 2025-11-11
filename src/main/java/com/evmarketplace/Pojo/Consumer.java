package com.evmarketplace.Pojo;

import javax.persistence.*;
import java.util.List;

@Entity
@Table(name = "consumers")
public class Consumer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String organization;
    private String role;

    // Buyer demographics fields
    @Column(name = "industry")
    private String industry; // OEM, Startup, Research, Fleet, Energy, Insurance, Government, Other
    
    @Column(name = "region")
    private String region; // North America, Europe, Asia, etc.
    
    @Column(name = "company_size")
    private String companySize; // Small (1-50), Medium (51-500), Large (501+)
    
    @Column(name = "use_case_type")
    private String useCaseType; // Research, Development, Analytics, Operations, etc.

    @OneToMany
    @JoinColumn(name = "buyer_id")
    private List<Order> orders;

    @OneToMany(mappedBy = "user")
    private List<Subscription> subscriptions;

    public Consumer() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getOrganization() { return organization; }
    public void setOrganization(String organization) { this.organization = organization; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getCompanySize() { return companySize; }
    public void setCompanySize(String companySize) { this.companySize = companySize; }

    public String getUseCaseType() { return useCaseType; }
    public void setUseCaseType(String useCaseType) { this.useCaseType = useCaseType; }

    public List<Order> getOrders() { return orders; }
    public void setOrders(List<Order> orders) { this.orders = orders; }

    public List<Subscription> getSubscriptions() { return subscriptions; }
    public void setSubscriptions(List<Subscription> subscriptions) { this.subscriptions = subscriptions; }
}
