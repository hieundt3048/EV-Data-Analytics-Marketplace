package com.evmarketplace.Service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

/**
 * S3ProviderService (Mock/Hybrid)
 * - Nếu có AWS credentials → upload lên AWS S3 (thật)
 * - Nếu chưa có AWS credentials → lưu file vào thư mục local "uploads/"
 */
@Service
public class S3ProviderService {

    // Nếu có thật thì điền bucketName thật, còn không cũng được
    private final String bucketName = "mock-local-bucket";

    // Biến này chỉ bật khi muốn dùng AWS thật
    private final boolean useRealAws = false; // đổi sang true nếu có tài khoản AWS

    public String uploadFile(String key, MultipartFile file) throws IOException {
        if (!useRealAws) {
            // --- MOCK MODE (local testing) ---
            File localDir = new File("uploads");
            if (!localDir.exists()) localDir.mkdirs();

            File dest = new File(localDir, file.getOriginalFilename());
            file.transferTo(dest);

            System.out.println("[MOCK] Saved file locally: " + dest.getAbsolutePath());

            return "mock://local/" + dest.getAbsolutePath().replace("\\", "/");
        }

        // --- REAL AWS MODE (chỉ chạy khi có AWS key) ---
        /*
        S3Client s3Client = S3Client.builder()
                .region(Region.AP_SOUTHEAST_1)
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create("YOUR_ACCESS_KEY", "YOUR_SECRET_KEY")
                ))
                .build();

        PutObjectRequest putReq = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(file.getContentType())
                .build();

        // Upload trực tiếp từ stream (ko cần file tạm)
        s3Client.putObject(putReq, RequestBody.fromBytes(file.getBytes()));

        return "https://" + bucketName + ".s3.amazonaws.com/" + key;
        */
        
        // Nếu chưa bật AWS mode thì chỉ mock thôi
        return "mock://not-uploaded";
    }

    // Overload method (nếu dùng kiểu uploadFile(file) cũ)
    public String uploadFile(MultipartFile file) throws IOException {
        return uploadFile("datasets/" + file.getOriginalFilename(), file);
    }
}
