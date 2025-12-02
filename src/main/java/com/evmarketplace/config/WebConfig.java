
// cấu hình CORS cho backend Spring Boot.
// Mục đích: Cho phép frontend (React, chạy ở http://localhost:5173) gọi API backend (http://localhost:8080/api/**) 
// mà không bị chặn bởi trình duyệt (CORS policy).
//
// - addCorsMappings: Cho phép các request từ frontend truy cập các endpoint /api/**
// - allowedOrigins: Chỉ cho phép từ http://localhost:5173 (dev mode)
// - allowedMethods: Cho phép các method GET, POST, PUT, DELETE, OPTIONS
// - allowedHeaders: Cho phép mọi header
// - allowCredentials: Cho phép gửi cookie/token qua lại
// - maxAge: Cache preflight request 3600s

package com.evmarketplace.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


@Configuration // Đánh dấu đây là class cấu hình Spring
public class WebConfig implements WebMvcConfigurer { // Triển khai WebMvcConfigurer để custom cấu hình web

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Cấu hình CORS cho tất cả các endpoint bắt đầu bằng /api/**
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173") // Chỉ cho phép từ frontend local
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Các HTTP method được phép
                .allowedHeaders("*") // Cho phép mọi header
                .allowCredentials(true) // Cho phép gửi cookie/token
                .maxAge(3600); // Cache preflight 1h
    }
}