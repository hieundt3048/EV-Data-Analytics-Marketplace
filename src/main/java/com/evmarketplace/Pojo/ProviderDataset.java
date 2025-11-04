package com.evmarketplace.Pojo;

import javax.persistence.*;

@Entity
@Table(name = "provider_datasets")
public class ProviderDataset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(length = 2000)
    private String description;

    private String s3Url;

    private long sizeBytes;

    // status: CREATED, UPLOADING, UPLOADED, ANONYMIZING, ANONYMIZED, ERASED
    private String status = "CREATED";

    // Policy fields
    private String pricingType; // per_request | subscription
    private Double price;

    @Column(length = 2000)
    private String usagePolicy;

    // owner provider id (nullable)
    private Long providerId;

    public ProviderDataset() {}

    // getters / setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getS3Url() { return s3Url; }
    public void setS3Url(String s3Url) { this.s3Url = s3Url; }

    public long getSizeBytes() { return sizeBytes; }
    public void setSizeBytes(long sizeBytes) { this.sizeBytes = sizeBytes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPricingType() { return pricingType; }
    public void setPricingType(String pricingType) { this.pricingType = pricingType; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getUsagePolicy() { return usagePolicy; }
    public void setUsagePolicy(String usagePolicy) { this.usagePolicy = usagePolicy; }

    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }
}
