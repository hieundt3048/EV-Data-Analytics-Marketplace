package com.evmarketplace.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.nio.file.Files;

@Service
public class S3ProviderService {

    @Value("${app.s3.useRealAws:false}")
    private boolean useRealAws;

    @Value("${app.s3.localUploadDir:uploads}")
    private String localUploadDir;

    @Value("${app.s3.bucket:evmarketplace-datasets}")
    private String bucketName;

    public static class S3Result {
        private final String url;
        private final String localPath;
        public S3Result(String url, String localPath) { this.url = url; this.localPath = localPath; }
        public String getUrl() { return url; }
        public String getLocalPath() { return localPath; }
    }

    public S3Result uploadFile(MultipartFile file) throws IOException {
        String key = "datasets/" + System.currentTimeMillis() + "-" + file.getOriginalFilename();
        if (!useRealAws) {
            File dir = new File(localUploadDir);
            if (!dir.exists()) dir.mkdirs();
            Path dest = Path.of(dir.getAbsolutePath(), System.currentTimeMillis() + "-" + file.getOriginalFilename());
            Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
            String url = "mock://local/" + dest.toAbsolutePath().toString().replace("\\", "/");
            return new S3Result(url, dest.toAbsolutePath().toString());
        }

        // If user wants real AWS: implement upload with AWS SDK v2 here (omitted for local-first approach)
        throw new UnsupportedOperationException("Real AWS upload not implemented in this project; set app.s3.useRealAws=false to use local mock.");
    }
}
