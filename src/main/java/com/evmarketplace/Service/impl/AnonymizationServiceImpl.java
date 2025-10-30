package com.evmarketplace.Service.impl;

import com.evmarketplace.Service.AnonymizationService;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class AnonymizationServiceImpl implements AnonymizationService {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
    private static final Pattern PHONE_PATTERN =
            Pattern.compile("\\b(0\\d{9}|\\+84\\d{9})\\b");
    private static final Pattern NAME_PATTERN =
            Pattern.compile("\\b([A-Z][a-z]+\\s[A-Z][a-z]+)\\b");

    /**
     * Bắt đầu job ẩn danh cho dataset theo productId (chạy bất đồng bộ)
     */
    @Override
    @Async
    public void startJob(UUID productId) {
        System.out.println("🚀 Bắt đầu job ẩn danh cho dataset: " + productId);

        // Giả định file lưu trữ dataset theo productId
        String filePath = "uploads/" + productId + ".txt";

        try {
            Path path = Paths.get(filePath);
            if (!Files.exists(path)) {
                System.err.println("❌ Không tìm thấy file cho dataset: " + filePath);
                return;
            }

            String content = Files.readString(path);

            // Ẩn danh thông tin PII
            String anonymized = EMAIL_PATTERN.matcher(content).replaceAll("[EMAIL_HIDDEN]");
            anonymized = PHONE_PATTERN.matcher(anonymized).replaceAll("[PHONE_HIDDEN]");
            anonymized = NAME_PATTERN.matcher(anonymized).replaceAll("[NAME_HIDDEN]");

            Files.writeString(path, anonymized);
            System.out.println("✅ Đã ẩn danh xong dataset: " + productId);

        } catch (IOException e) {
            System.err.println("⚠️ Lỗi xử lý ẩn danh dataset " + productId + ": " + e.getMessage());
        }
    }
}
