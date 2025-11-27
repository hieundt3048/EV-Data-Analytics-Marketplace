package com.evmarketplace;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.web.reactive.function.client.WebClient;

import com.evmarketplace.Repository.DataProductRepository;
import com.evmarketplace.Repository.DataProviderRepository;
import com.evmarketplace.Repository.RoleRepository;
import com.evmarketplace.Repository.ProviderDatasetRepository;
import com.evmarketplace.Service.UserService;
import com.evmarketplace.auth.JwtFilter;

import java.util.Arrays;


@SpringBootApplication(scanBasePackages = "com.evmarketplace")
@EntityScan(basePackages = {
    "com.evmarketplace.Pojo",
    "com.evmarketplace.billing",
    "com.evmarketplace.data",
    "com.evmarketplace.provider",
    "com.evmarketplace.providers",
    "com.evmarketplace.marketplace",
    "com.evmarketplace.dto",        // THÊM package DTO
    "com.evmarketplace.aspect"      // THÊM package Aspect
})
@EnableJpaRepositories(basePackages = "com.evmarketplace.Repository") // SỬA: dùng basePackages thay vì basePackageClasses
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
    
    // THÊM Bean cho WebClient
    @Bean
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }

    @Bean
    public CommandLineRunner seed(UserService userService,
                                 DataProviderRepository dataProviderRepository,
                                 DataProductRepository dataProductRepository,
                                 ProviderDatasetRepository providerDatasetRepository,
                                 RoleRepository roleRepository) {
        return args -> {
            // --- TẠO NGƯỜI DÙNG MẪU (DEMO USER) ---
            com.evmarketplace.Pojo.User u = userService.findByEmail("consumer1@example.com").orElseGet(() -> userService.register("Demo User","consumer1@example.com","password"));
            
            // Gán vai trò "Consumer" cho người dùng mẫu.
            // Hàm `assignRoleToUser` sẽ tự tạo vai trò nếu nó chưa tồn tại.
            userService.assignRoleToUser(u, "Consumer");

            // --- TẠO NGƯỜI DÙNG QUẢN TRỊ (ADMIN) MẶC ĐỊNH ---
            // Tương tự, tìm hoặc tạo người dùng admin với email "admin@ev.com".
            // Mật khẩu là "adminpass".
            com.evmarketplace.Pojo.User admin = userService.findByEmail("admin@ev.com").orElseGet(() -> userService.register("Administrator","admin@ev.com","adminpass","ACME", true));
            // Gán vai trò "Admin" cho người dùng này.
            userService.assignRoleToUser(admin, "Admin");

            // --- TẠO NHÀ CUNG CẤP DỮ LIỆU MẪU ---
            com.evmarketplace.Pojo.User providerUser = userService.findByEmail("provider1@example.com")
                .orElseGet(() -> userService.register("Provider One", "provider1@example.com", "password", "EV Insight Labs", true));
            userService.assignRoleToUser(providerUser, "Provider");
            providerUser.setProviderApproved(true);
            String providerOrg = providerUser.getOrganization() != null ? providerUser.getOrganization() : "EV Insight Labs";
            userService.updateUser(providerUser.getId(), providerUser.getName(), providerOrg, true, Arrays.asList("Provider"));

            System.out.println("=== DEMO DATA INITIALIZED ===");
            System.out.println("Consumer: consumer1@example.com / password");
            System.out.println("Admin: admin@ev.com / adminpass");
            System.out.println("Provider: provider1@example.com / password");
        };
    }

    @Bean
    public FilterRegistrationBean<JwtFilter> jwtFilterRegistration(JwtFilter filter) {
        // Tạo một đối tượng đăng ký cho filter.
        FilterRegistrationBean<JwtFilter> reg = new FilterRegistrationBean<>();
        // Thiết lập filter cần đăng ký.
        reg.setFilter(filter);
        // Áp dụng filter này cho tất cả các URL bắt đầu bằng "/api/".
        // NHƯNG loại trừ /api/v1/* vì endpoint này dùng API Key thay vì JWT
        reg.addUrlPatterns("/api/*");
        // Thiết lập thứ tự ưu tiên của filter (số nhỏ hơn được thực thi trước).
        reg.setOrder(1);
        return reg;
    }
}