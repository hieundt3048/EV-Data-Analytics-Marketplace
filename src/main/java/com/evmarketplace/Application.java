package com.evmarketplace;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.web.reactive.function.client.WebClient;

import com.evmarketplace.Repository.ConsumerProfileRepository;
import com.evmarketplace.Repository.DataProductRepository;
import com.evmarketplace.Repository.DataProviderRepository;
import com.evmarketplace.Repository.DatasetMetadataRepository;
import com.evmarketplace.Repository.InvoiceRepository;
import com.evmarketplace.Repository.RoleRepository;
import com.evmarketplace.Repository.UserRepository;
import com.evmarketplace.Repository.ProviderDatasetRepository;
import com.evmarketplace.Service.UserService;
import com.evmarketplace.auth.JwtFilter;
import com.evmarketplace.data.DataProduct;
import com.evmarketplace.data.DataProvider;
import com.evmarketplace.data.DataType;
import com.evmarketplace.data.Format;
import com.evmarketplace.data.ProductStatus;
import com.evmarketplace.Pojo.ProviderDataset;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;


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
            // Tìm người dùng với email "test@ev.com".
            // Nếu không tìm thấy (.orElseGet), thì gọi hàm `userService.register` để tạo mới.
            // Mật khẩu là "password".
            com.evmarketplace.Pojo.User u = userService.findByEmail("test@ev.com").orElseGet(() -> userService.register("Demo User","test@ev.com","password"));
            
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
            .orElseGet(() -> userService.register("Provider One", "provider1@example.com", "providerpass", "EV Insight Labs", true));
            userService.assignRoleToUser(providerUser, "Provider");
            providerUser.setProviderApproved(true);
        String providerOrg = providerUser.getOrganization() != null ? providerUser.getOrganization() : "EV Insight Labs";
        com.evmarketplace.Pojo.User savedProviderUser = userService.updateUser(providerUser.getId(), providerUser.getName(), providerOrg, true, Arrays.asList("Provider"));

            DataProvider providerEntity = dataProviderRepository.findByUser(savedProviderUser)
                    .orElseGet(() -> {
                        DataProvider dp = new DataProvider(savedProviderUser, "EV Insight Labs");
                        dp.setDescription("Specialist in EV charging and telemetry datasets");
                        dp.setApproved(true);
                        return dataProviderRepository.save(dp);
                    });

            // --- TẠO SẢN PHẨM DỮ LIỆU MẪU ---
            List<DataProduct> existingProducts = dataProductRepository.findAll();
            boolean hasTelemetry = existingProducts.stream().anyMatch(p -> "Urban Fleet Telemetry 2024".equalsIgnoreCase(p.getTitle()));
            boolean hasCharging = existingProducts.stream().anyMatch(p -> "Fast Charging Session Logs".equalsIgnoreCase(p.getTitle()));
            boolean hasBattery = existingProducts.stream().anyMatch(p -> "Battery Health Benchmark".equalsIgnoreCase(p.getTitle()));

            List<DataProduct> seeds = new java.util.ArrayList<>();
            if (!hasTelemetry) {
                DataProduct telemetry = new DataProduct(providerEntity, "Urban Fleet Telemetry 2024");
                telemetry.setDescription("Telematics data from 2,500 EVs operating in Tier-1 cities.");
                telemetry.setCategories(Arrays.asList("Telematics", "Fleet"));
                telemetry.setTags(Arrays.asList("gps", "speed", "soc"));
                telemetry.setDataType(DataType.TELEMETRY);
                telemetry.setFormat(Format.CSV);
                telemetry.setSizeBytes(1_250_000_000L);
                telemetry.setRegion("APAC");
                telemetry.setStartTime(Instant.now().minusSeconds(60L * 60 * 24 * 30));
                telemetry.setStatus(ProductStatus.PUBLISHED); // SỬA: thành PUBLISHED để test
                seeds.add(telemetry);
            }
            if (!hasCharging) {
                DataProduct charging = new DataProduct(providerEntity, "Fast Charging Session Logs");
                charging.setDescription("DC fast-charging sessions with dwell time and grid impact metrics.");
                charging.setCategories(Arrays.asList("Charging", "Infrastructure"));
                charging.setTags(Arrays.asList("dcfc", "power", "queue"));
                charging.setDataType(DataType.CHARGING);
                charging.setFormat(Format.PARQUET);
                charging.setSizeBytes(980_000_000L);
                charging.setRegion("North America");
                charging.setStartTime(Instant.now().minusSeconds(60L * 60 * 24 * 45));
                charging.setStatus(ProductStatus.PUBLISHED); // SỬA: thành PUBLISHED để test
                seeds.add(charging);
            }
            if (!hasBattery) {
                DataProduct battery = new DataProduct(providerEntity, "Battery Health Benchmark");
                battery.setDescription("Monthly SOH benchmarks collected from mixed OEM fleets.");
                battery.setCategories(Arrays.asList("Battery", "Health"));
                battery.setTags(Arrays.asList("soh", "temperature", "cycles"));
                battery.setDataType(DataType.BATTERY);
                battery.setFormat(Format.JSON);
                battery.setSizeBytes(540_000_000L);
                battery.setRegion("Europe");
                battery.setStartTime(Instant.now().minusSeconds(60L * 60 * 24 * 60));
                battery.setStatus(ProductStatus.PUBLISHED); // SỬA: thành PUBLISHED để test
                seeds.add(battery);
            }

            if (!seeds.isEmpty()) {
                dataProductRepository.saveAll(seeds);
                System.out.println("Created " + seeds.size() + " sample data products");
            }

            System.out.println("=== DEMO DATA INITIALIZED ===");
            System.out.println("Consumer: test@ev.com / password");
            System.out.println("Admin: admin@ev.com / adminpass");
            System.out.println("Provider: provider1@example.com / providerpass");
        };
    }

    @Bean
    public FilterRegistrationBean<JwtFilter> jwtFilterRegistration(JwtFilter filter) {
        // Tạo một đối tượng đăng ký cho filter.
        FilterRegistrationBean<JwtFilter> reg = new FilterRegistrationBean<>();
        // Thiết lập filter cần đăng ký.
        reg.setFilter(filter);
        // Áp dụng filter này cho tất cả các URL bắt đầu bằng "/api/".
        reg.addUrlPatterns("/api/*");
        // Thiết lập thứ tự ưu tiên của filter (số nhỏ hơn được thực thi trước).
        reg.setOrder(1);
        return reg;
    }
}