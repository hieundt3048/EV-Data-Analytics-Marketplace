package com.evmarketplace.Service;

import com.evmarketplace.Pojo.ProviderDataset;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Files;
import java.util.regex.Pattern;

@Service
public class AnonymizationService {

    private final ProviderDatasetService datasetService;

    public AnonymizationService(ProviderDatasetService datasetService) {
        this.datasetService = datasetService;
    }

    private static final Pattern EMAIL_RE = Pattern.compile("[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+");
    private static final Pattern PHONE_RE = Pattern.compile("(?:\\+?\\d{1,3}[-.\\s]?)?(?:\\(?\\d{2,4}\\)?[-.\\s]?)?\\d{3,4}[-.\\s]?\\d{3,4}");

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

    // GDPR erase helper
    public void eraseLocalFiles(String localPath) {
        try {
            if (localPath == null) return;
            Path p = Path.of(localPath);
            Files.deleteIfExists(p);
            Files.deleteIfExists(Path.of(localPath + ".anonymized"));
        } catch (Exception ignored) {}
    }
}
