package com.evmarketplace.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Cấu hình xử lý bất đồng bộ (asynchronous) cho Spring Boot.
 * Cho phép các method có @Async annotation chạy trên thread pool riêng biệt
 * thay vì chặn main thread, giúp cải thiện hiệu năng và khả năng đáp ứng của ứng dụng.
 */
@Configuration
@EnableAsync // Kích hoạt hỗ trợ xử lý bất đồng bộ trong Spring
public class AsyncConfig {

    /**
     * Tạo thread pool executor cho các tác vụ bất đồng bộ.
     * @return Executor để xử lý các @Async methods.
     */
    @Bean(name = "anonExecutor")
    public Executor anonExecutor() {
        ThreadPoolTaskExecutor exec = new ThreadPoolTaskExecutor();
        exec.setCorePoolSize(2);        // Số lượng thread tối thiểu luôn sẵn sàng
        exec.setMaxPoolSize(5);         // Số lượng thread tối đa có thể tạo ra
        exec.setQueueCapacity(50);      // Số lượng task có thể chờ trong queue
        exec.setThreadNamePrefix("anon-"); // Prefix cho tên thread (giúp debug dễ dàng)
        exec.initialize();              // Khởi tạo thread pool
        return exec;
    }
}
