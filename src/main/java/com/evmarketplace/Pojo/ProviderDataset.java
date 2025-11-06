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

    @Column(name = "s3url")
    private String s3Url;

    @Column(name = "size_bytes")
    private long sizeBytes;

    // status: CREATED, UPLOADING, UPLOADED, PENDING_REVIEW, APPROVED, REJECTED, ANONYMIZING, ANONYMIZED, ERASED
    private String status = "CREATED";

    // Policy fields
    @Column(name = "pricing_type")
    private String pricingType; // per_request | subscription
    private Double price;

    @Column(name = "usage_policy", length = 2000)
    private String usagePolicy;

    // Metadata fields for filtering
    private String category; // charging_behavior, battery_health, route_optimization, energy_consumption
    
    @Column(name = "time_range")
    private String timeRange; // 2020-2021, 2021-2022, 2022-2023, 2023-2024, 2024-present
    
    private String region; // north_america, europe, asia, australia, africa, south_america
    
    @Column(name = "vehicle_type")
    private String vehicleType; // sedan, suv, truck, bus, motorcycle, other
    
    @Column(name = "battery_type")
    private String batteryType; // lithium_ion, solid_state, nickel_metal_hydride, lead_acid, other
    
    @Column(name = "data_format")
    private String dataFormat; // CSV, JSON, XML, Parquet, other

    // owner provider id (nullable)
    @Column(name = "provider_id")
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

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTimeRange() { return timeRange; }
    public void setTimeRange(String timeRange) { this.timeRange = timeRange; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public String getBatteryType() { return batteryType; }
    public void setBatteryType(String batteryType) { this.batteryType = batteryType; }

    public String getDataFormat() { return dataFormat; }
    public void setDataFormat(String dataFormat) { this.dataFormat = dataFormat; }

    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }
}
