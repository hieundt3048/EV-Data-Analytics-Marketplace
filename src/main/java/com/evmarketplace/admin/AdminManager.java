package com.evmarketplace.admin;

import java.util.List;

public class AdminManager {
    private String adminId;

    public AdminManager(String adminId) {
        this.adminId = adminId;
    }

    public void manageUsers(List<String> userIds) {
        // Logic to manage users
    }

    public void processPayments(List<String> paymentIds) {
        // Logic to process payments
    }

    public void generateReports() {
        // Logic to generate reports
    }

    public String getAdminId() {
        return adminId;
    }

    public void setAdminId(String adminId) {
        this.adminId = adminId;
    }
}