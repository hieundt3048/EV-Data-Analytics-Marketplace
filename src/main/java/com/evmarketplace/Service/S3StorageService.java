package com.evmarketplace.Service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

/**
 * Service chịu trách nhiệm upload file lên AWS S3.
 */
public interface S3StorageService {
    /**
     * Upload file lên S3 và trả về URL truy cập.
     *
     * @param datasetId ID của dataset.
     * @param file      Multipart file tải lên.
     * @return URL public của file trên S3.
     * @throws IOException nếu có lỗi trong quá trình upload.
     */
    String uploadFile(UUID datasetId, MultipartFile file) throws IOException;
}
