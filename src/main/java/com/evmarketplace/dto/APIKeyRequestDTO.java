package com.evmarketplace.dto;

import java.util.List;

public class APIKeyRequestDTO {
    private String name;
    private Integer rateLimit; // Requests per minute
    private Integer expiryDays; // Days until expiry
    private List<String> scopes; // Permissions: read:datasets, download:data, etc.

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
    
    public Integer getRateLimit() {
        return rateLimit;
    }
    
    public void setRateLimit(Integer rateLimit) {
        this.rateLimit = rateLimit;
    }
    
    public Integer getExpiryDays() {
        return expiryDays;
    }
    
    public void setExpiryDays(Integer expiryDays) {
        this.expiryDays = expiryDays;
    }
    
    public List<String> getScopes() {
        return scopes;
    }
    
    public void setScopes(List<String> scopes) {
        this.scopes = scopes;
    }
}

