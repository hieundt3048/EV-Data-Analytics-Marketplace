package com.evmarketplace.consumers;

public class DataConsumer {
    private String consumerId;
    private String name;

    public DataConsumer(String consumerId, String name) {
        this.consumerId = consumerId;
        this.name = name;
    }

    public String getConsumerId() {
        return consumerId;
    }

    public String getName() {
        return name;
    }

    public void searchData(String query) {
        // Implementation for searching data
    }

    public void purchaseData(String dataId) {
        // Implementation for purchasing data
    }

    public void accessAPI() {
        // Implementation for accessing the API
    }
}