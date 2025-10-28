// Mục đích: Mô hình DataAsset đại diện cho file/asset gắn với DataProduct.
// Đáp ứng: Lưu thông tin file lưu trữ, uri, kích thước và checksum theo class diagram.
package com.evmarketplace.data;

// Mục đích: Thực thể DataAsset đại diện từng file/bản ghi dữ liệu.
// Đáp ứng: Cho phép Spring Data quản lý metadata về asset được đính kèm với DataProduct.

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "data_assets", indexes = {
    @Index(name = "idx_data_assets_product", columnList = "product_id")
})
public class DataAsset {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "storage_uri", nullable = false)
    private String storageUri;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "size_bytes")
    private long sizeBytes;

    @Column(name = "checksum")
    private String checksum;

    @Column(name = "mime_type")
    private String mimeType;

    protected DataAsset() {
        // Bắt buộc cho JPA
    }

    public DataAsset(UUID productId, String storageUri) {
        this.productId = productId;
        this.storageUri = storageUri;
    }

    public UUID getId() {
        return id;
    }

    public UUID getProductId() {
        return productId;
    }

    public void setProductId(UUID productId) {
        this.productId = productId;
    }

    public String getStorageUri() {
        return storageUri;
    }

    public void setStorageUri(String storageUri) {
        this.storageUri = storageUri;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public long getSizeBytes() {
        return sizeBytes;
    }

    public void setSizeBytes(long sizeBytes) {
        this.sizeBytes = sizeBytes;
    }

    public String getChecksum() {
        return checksum;
    }

    public void setChecksum(String checksum) {
        this.checksum = checksum;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }
}
