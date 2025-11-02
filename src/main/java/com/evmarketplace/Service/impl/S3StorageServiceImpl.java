package com.evmarketplace.Service.impl;

import com.evmarketplace.Service.S3StorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * Development-friendly implementation of S3StorageService.
 *
 * This implementation does NOT call AWS S3. Instead it stores files locally under
 * the project's `uploads/s3` directory and returns a relative path. It's useful for
 * local development and testing when AWS credentials are not available.
 */
@Service
public class S3StorageServiceImpl implements S3StorageService {

    private static final Logger logger = LoggerFactory.getLogger(S3StorageServiceImpl.class);
    private final Path baseDir = Paths.get("uploads", "s3");

    @Override
    public String uploadFile(UUID datasetId, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IOException("Empty file");
        }

        Files.createDirectories(baseDir);
        Path datasetDir = baseDir.resolve(datasetId.toString());
        Files.createDirectories(datasetDir);

        String original = file.getOriginalFilename();
        String safeName = (original == null) ? "file" : original.replaceAll("[^a-zA-Z0-9._-]", "_");
        String filename = UUID.randomUUID().toString() + "_" + safeName;
        Path target = datasetDir.resolve(filename);

        logger.info("Saving uploaded file to {}", target.toAbsolutePath());
        file.transferTo(target.toFile());

        // Return a path that the rest of the app can use. For local dev we return the file:// URL
        return target.toAbsolutePath().toUri().toString();
    }
}
