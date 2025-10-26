// Mục đích: Mô hình DataAsset đại diện cho file/asset gắn với DataProduct.
// Đáp ứng: Lưu thông tin file lưu trữ, uri, kích thước và checksum theo class diagram.
package com.evmarketplace.data;

import java.util.UUID;

public class DataAsset {
    public UUID id;
    public UUID productId;
    public String storageUri;
    public String fileName;
    public long sizeBytes;
    public String checksum;
    public String mimeType;

    public DataAsset() {}
}
