package com.evmarketplace.Service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@Service
public class S3ProviderService {

    // Upload file lên S3, trả về URL (mẫu mô phỏng)
    public String uploadFile(MultipartFile file) throws IOException {
        // TODO: triển khai AWS SDK thực tế tại đây
        // Ví dụ:
        // String key = "datasets/" + file.getOriginalFilename();
        // s3Client.putObject(new PutObjectRequest(bucketName, key,
        // file.getInputStream(), metadata));
        // return s3Client.getUrl(bucketName, key).toString();

        // Giả lập kết quả
        return "https://s3.amazonaws.com/fake-bucket/" + file.getOriginalFilename();
    }

    public String uploadFile(String key, MultipartFile file) {
        throw new UnsupportedOperationException("Not supported yet.");
    }
}
