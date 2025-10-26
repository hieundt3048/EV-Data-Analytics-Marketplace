// Mục đích: Mô hình metadata cho bộ dữ liệu (DatasetMetadata).
// Đáp ứng: Lưu các key/value metadata liên quan tới DataProduct theo class diagram.
package com.evmarketplace.data;

import java.util.Map;
import java.util.UUID;

public class DatasetMetadata {
    public UUID id;
    public UUID productId;
    public Map<String,String> keyValues;

    public DatasetMetadata() {}
}
