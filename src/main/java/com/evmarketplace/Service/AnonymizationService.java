package com.evmarketplace.Service;

import com.evmarketplace.Pojo.ProviderDataset;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Files;
import java.util.regex.Pattern;

//xử lý ẩn danh hóa dữ liệu (anonymization) cho dataset của provider
@Service
public class AnonymizationService {

    // Service thao tác với bảng provider_datasets

    private final ProviderDatasetService datasetService;

    public AnonymizationService(ProviderDatasetService datasetService) {
        this.datasetService = datasetService;
    }

    // Regex tìm email và số điện thoại trong file
    private static final Pattern EMAIL_RE = Pattern.compile("[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+");
    private static final Pattern PHONE_RE = Pattern.compile("(?:\\+?\\d{1,3}[-.\\s]?)?(?:\\(?\\d{2,4}\\)?[-.\\s]?)?\\d{3,4}[-.\\s]?\\d{3,4}");


    /**
     * Ẩn danh hóa file dữ liệu (chạy async):
     * - Đọc file gốc, tìm và che dấu email/số điện thoại
     * - Ghi ra file mới .anonymized
     * - Cập nhật trạng thái dataset
     * - Nếu lỗi thì set status ANONYMIZATION_FAILED
     */
    @Async("anonExecutor")
    public void anonymizeFileAsync(Long datasetId, String localFilePath) {
        ProviderDataset ds = datasetService.findById(datasetId);
        if (ds == null) return;
        try {
            ds.setStatus("ANONYMIZING");
            datasetService.save(ds);

            Path p = Path.of(localFilePath);
            if (!Files.exists(p)) {
                ds.setStatus("ANONYMIZATION_FAILED");
                datasetService.save(ds);
                return;
            }

            String content = Files.readString(p);
            String step1 = EMAIL_RE.matcher(content).replaceAll("[REDACTED_EMAIL]");
            String step2 = PHONE_RE.matcher(step1).replaceAll("[REDACTED_PHONE]");

            Path out = Path.of(p.toString() + ".anonymized");
            Files.writeString(out, step2);

            ds.setStatus("ANONYMIZED");
            datasetService.save(ds);
        } catch (IOException e) {
            ds.setStatus("ANONYMIZATION_FAILED");
            datasetService.save(ds);
        }
    }

    /**
     * Xóa file dữ liệu gốc và file đã ẩn danh hóa (theo yêu cầu GDPR)
     * - Dùng cho chức năng "right to erasure" hoặc khi provider xóa dataset
     */
    public void eraseLocalFiles(String localPath) {
        try {
            if (localPath == null) return;
            Path p = Path.of(localPath);
            Files.deleteIfExists(p);
            Files.deleteIfExists(Path.of(localPath + ".anonymized"));
        } catch (Exception ignored) {}
    }
}
