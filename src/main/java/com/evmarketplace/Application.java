package com.evmarketplace;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import com.evmarketplace.Repository.ConsumerProfileRepository;
import com.evmarketplace.Repository.DataProviderRepository;
import com.evmarketplace.Repository.DatasetMetadataRepository;
import com.evmarketplace.Repository.InvoiceRepository;
import com.evmarketplace.Repository.RoleRepository;
import com.evmarketplace.Repository.UserRepository;
import com.evmarketplace.Service.UserService;
import com.evmarketplace.auth.JwtFilter;


@SpringBootApplication(scanBasePackages = "com.evmarketplace")
@EntityScan(basePackages = {
    "com.evmarketplace.Pojo",
    "com.evmarketplace.billing",
    "com.evmarketplace.data",
    "com.evmarketplace.providers",
    "com.evmarketplace.marketplace"
})
@EnableJpaRepositories(basePackageClasses = {
    UserRepository.class,
    RoleRepository.class,
    ConsumerProfileRepository.class,
    DatasetMetadataRepository.class,
    InvoiceRepository.class,
    DataProviderRepository.class,
    com.evmarketplace.Repository.DataProductRepository.class,
    com.evmarketplace.Repository.PurchaseRepository.class,
    com.evmarketplace.Repository.TransactionRepository.class,
    com.evmarketplace.Repository.APIKeyRepository.class
})
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Bean
    public CommandLineRunner seed(UserService userService) {
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
