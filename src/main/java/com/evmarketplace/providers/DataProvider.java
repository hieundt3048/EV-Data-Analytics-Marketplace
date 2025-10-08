package com.evmarketplace.providers;

public class DataProvider {
    private String providerId;
    private String name;

    public DataProvider(String providerId, String name) {
        this.providerId = providerId;
        this.name = name;
    }

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void registerData(String data) {
        // Implementation for registering data
    }

    public void setPricingPolicy(String policy) {
        // Implementation for setting pricing policy
    }

    public void trackRevenue() {
        // Implementation for tracking revenue
    }
}