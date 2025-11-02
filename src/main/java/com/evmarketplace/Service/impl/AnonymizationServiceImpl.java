package com.evmarketplace.Service.impl;

import com.evmarketplace.Service.AnonymizationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class AnonymizationServiceImpl implements AnonymizationService {

    private static final Logger logger = LoggerFactory.getLogger(AnonymizationServiceImpl.class);

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
        logger.info("Bắt đầu job ẩn danh cho dataset: {}", productId);

        // Giả định file lưu trữ dataset theo productId
        Path uploadsDir = Paths.get("uploads");
        try {
            if (!Files.exists(uploadsDir)) {
                Files.createDirectories(uploadsDir);
                logger.debug("Tạo thư mục uploads: {}", uploadsDir.toAbsolutePath());
            }
        } catch (IOException e) {
            logger.error("Không thể tạo thư mục uploads: {}", uploadsDir, e);
            return;
        }

        Path path = uploadsDir.resolve(productId.toString() + ".txt");

        if (!Files.exists(path)) {
            logger.warn("Không tìm thấy file cho dataset: {}", path.toAbsolutePath());
            return;
        }

        try {
            // Read file content in a Java 8 compatible way
            byte[] bytes = Files.readAllBytes(path);
            String content = new String(bytes, StandardCharsets.UTF_8);

            // Ẩn danh thông tin PII
            String anonymized = EMAIL_PATTERN.matcher(content).replaceAll("[EMAIL_HIDDEN]");
            anonymized = PHONE_PATTERN.matcher(anonymized).replaceAll("[PHONE_HIDDEN]");
            anonymized = NAME_PATTERN.matcher(anonymized).replaceAll("[NAME_HIDDEN]");

            // Write anonymized content to a temp file then atomically move into place
            Path tempFile = Files.createTempFile(uploadsDir, "anonymized-", ".tmp");
            Files.write(tempFile, anonymized.getBytes(StandardCharsets.UTF_8));

            try {
                Files.move(tempFile, path, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
            } catch (AtomicMoveNotSupportedException amnse) {
                // Fallback if atomic move not supported on filesystem
                logger.debug("Atomic move not supported, falling back to non-atomic move");
                Files.move(tempFile, path, StandardCopyOption.REPLACE_EXISTING);
            }

            logger.info("Đã ẩn danh xong dataset: {}", productId);

        } catch (IOException e) {
            logger.error("Lỗi xử lý ẩn danh dataset {}", productId, e);
        }
    }
}
